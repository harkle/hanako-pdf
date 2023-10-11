import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Component } from 'hanako-ts/dist-legacy/Component';

export class Clock extends Component {
  constructor() {
    super('Clock', false);
  }

  public async init(): Promise<void> {
    await super.init();


    setInterval(() => {
      this.draw();
    }, 40);

    this.success();
  }

  private draw() {
    const canvas = $('canvas');

    const width = canvas.get(0).width = canvas.width() * 2;
    const height = canvas.get(0).height = canvas.height() * 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const ctx = canvas.get(0).getContext('2d');

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, width, height);

    // draw a clock
    ctx.translate(centerX, centerY);
    ctx.scale(2, 2);
    ctx.rotate(-Math.PI / 2);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    
    // Hour marks
    ctx.save();
    ctx.lineWidth = 7;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate(Math.PI / 6);
      ctx.moveTo(95, 0);
      ctx.lineTo(120, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Minute marks
    ctx.save();
    ctx.lineWidth = 3;
    for (let i = 0; i < 60; i++) {
      if (i % 5 != 0) {
        ctx.beginPath();
        ctx.moveTo(110, 0);
        ctx.lineTo(120, 0);
        ctx.stroke();
      }
      ctx.rotate(Math.PI / 30);
    }
    ctx.restore();

    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millisecond = date.getMilliseconds();

    // write Hours
    ctx.save();
    ctx.rotate(hour * (Math.PI / 6) + (Math.PI / 360) * minute + (Math.PI / 21600) * second);
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();
    ctx.restore();

    // write Minutes
    ctx.save();
    ctx.rotate((Math.PI / 30) * minute + (Math.PI / 1800));
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(112, 0);
    ctx.stroke();
    ctx.restore();

    // Write seconds
    let stepSeconds = (second + (millisecond / 1000)) * 60 / 58;
    if (stepSeconds > 60) stepSeconds = 60;
    ctx.save();
    ctx.rotate(stepSeconds * Math.PI / 30);
    ctx.strokeStyle = '#D40000';
    ctx.fillStyle = '#D40000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(83, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, 0, 12, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }
}
