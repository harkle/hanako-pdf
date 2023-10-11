const path = require('path');
const fs = require('fs');
const basePath = './demo';

var config = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    
  },
  devtool: 'source-map',
  mode: 'production',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  }
};

let configs = [];
fs.readdirSync(basePath + '/ts').forEach(element => {
  const extension = path.extname(element);
  const filename = element.replace(extension, '');
  
  if (extension == '.ts') {
    console.log(element);
    configs.push({...config, ...{
      entry: basePath + '/ts/' + element,
      output: {
        path: path.resolve(__dirname, basePath + '/dist'),
        filename: filename + '-bundle.js'
      }
    }});
  }
});

module.exports = configs;
