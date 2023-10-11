# Hanako PDF

[![npm version](https://badge.fury.io/js/hanako-pdf.svg)](https://badge.fury.io/js/hanako-pdf)

> A simple HTML to PDF converter for Hanako TS using jsPDF.

## Demo & docs

- Demo & user friendly docs → https://harkle.github.io/hanako-pdf/demo/<br/>
- Class and methods docs → https://harkle.github.io/hanako-pdf/docs/

## Installation
### Install with NPM

You can install `hanako-pdf` using the [npm](https://www.npmjs.com/) package manager.

```sh
npm install hanako-pdf
```

## Usage
```javascript
import { HanakoPDF } from 'hanako-pdf';

//HanakoPDF.print(page: Collection, options: HanakoPDFOptions, target?: Collection, printElementCallback?: PrintElementallback, jsPDFOptions?: jsPDFOptions);
HanakoPDF.print($('.pdf'), {
  fontPath: 'fonts',
});
```

### Parameters
- **page**: a hanako-ts collection targeting the HTMLElement of your PDF
- **options**:  hanako-pdf options (see details below)
- **target**:  a hanako-ts collection targeting an iFrame for outputting PDF (disable file saving)
- **printElementCallback(element: PDFElement, pageTop: number)**: a callback function to draw custom stuff
- **jsPDFOptions**:  any available option is jsPDF

### Options
- **fontPath**: the location of your `fonts` folder. This option is mandatory.
- **selector**: to change the default export selector (`.hp-export`) 
- **filename**: specify a filename
- **pageTop**: page top margin from page #2 in centimeters
- **pageBottom**: page bottom margin in centimeters
- **displayMode**: PDF default view
- **pageNumberOptions**: change page numbering format and position (see below)
- **fontScaleFactorFix**: adjust the font scale factor
- **debug**: enable debug mode (draw rect around elements)

### Page number options
- **format**: page number format (default: `'{current} / {total}'`;
- **x**: horizontal position from left in centimeters
- **y**: vertical position from top in centimeters
- **align**: text align (`'left'`, `'center'`, `'right'`);

## Tips & Tricks

### Font usage

Convert font using this tool: https://www.giftofspeed.com/base64-encoder/. Then place `.b64` files into the `fonts` folder (location and name defined by yourself). Don't forget to create a `fonts.json` file in your `fonts` folder (see demo folder).

## Not supported

These features are not support because they are causing issues with the PDF rendering.

- letter spacing
- background images
- external images
- sup, sub
- strong, em, etc. nested inside elements
