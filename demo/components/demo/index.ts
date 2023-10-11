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

      HanakoPDF.print($('.pdf'), {
        fontPath: 'fonts',
        pageTop: 2,
        pageBottom: 27.7,
        fontScaleFactorFix: .99,
        pageNumberOptions: {
          format: 'Page {page} of {pages}',
          x: 2,
          y: 28.5,
          align: 'left'
        },
        debug: true
      }, $('#pdf-iframe'));
    });

    $('#btn-export-pdf').on('click', (event: Event) => {
      event.preventDefault();

      HanakoPDF.print($('.pdf'), {
        fontPath: 'fonts',
        filename: 'demo.pdf',
        pageTop: 2,
        pageBottom: 27.7,
        pageNumberOptions: {
          format: 'Page {page} of {pages}',
          x: 2,
          y: 28.5,
          align: 'left'
        },
        debug: true
      });
    });

    this.success();
  }
}
