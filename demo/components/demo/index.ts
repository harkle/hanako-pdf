import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Component } from 'hanako-ts/dist-legacy/Component';
import { HanakoPDF } from '../../../dist-legacy/HanakoPDF';

export class Demo extends Component {
  constructor() {
    super('Demo', false);
  }


  public async init(): Promise<void> {
    await super.init();

    $('#btn-iframe-pdf').on('click', (event: Event) => {
      event.preventDefault();

      HanakoPDF.print($('.pdf'));
    });

    $('#btn-export-pdf').on('click', (event: Event) => {
      event.preventDefault();

      HanakoPDF.print($('.pdf'));
    });

    this.success();
  }
}
