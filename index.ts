import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Collection } from "hanako-ts/dist-legacy/Collection";
import { jsPDF, jsPDFOptions } from 'jspdf';

type Fonts = {
  [key: string]: string;
}

export class HanakoPDF {
  private static hasBeenInitialized: boolean = false;
  private static debug: boolean = false;
  private static fonts: Fonts = {};
  private static jsPDF: jsPDF;
  private static element: Collection;
  private static outputElement: Collection;

  /*
   * Init & load fonts from server
   */
  public static async init() {
    let path = this.element.data('path');
    let fonts = this.element.data('fonts');

    // Output an error if path is empty
    if (path === '' || path === undefined) {
      console.error('hanako-pdf: path is empty');
      return;
    }

    // Output an error if fonts list is empty
    if (fonts === '' || fonts === undefined) {
      console.error('hanako-pdf: font list is empty');
      return;
    }

    // Retrieve debug mode
    this.debug = this.element.data('debug') === 'true';

    // Retrieve output element
    this.outputElement = $(this.element.data('output'));

    // Load fonts
    await Promise.all(fonts.split(',').map(async (fontName: string) => {
      var font: string = await $.httpRequest({
        url: path + '/' + fontName + '.b64',
        dataType: 'text'
      });

      this.fonts[fontName] = font;
    }));

    this.hasBeenInitialized = true;
  }

  /*
   * Export PDF
   */
  public static async print(element: Collection, options?: jsPDFOptions) {
    this.element = element;

    // Load fonts if not already loaded
    if (!this.hasBeenInitialized) await this.init();

    // Initialize jsPDF
    this.jsPDF = new jsPDF({
      ...{
        orientation: 'portrait',
        unit: 'cm',
        format: 'A4'
      },
      ...options
    });

    // Add "print" class to PDF element (enable specific CSS rules for PDF)
    element.addClass('print');

    console.log(this.debug);

    // Remove "print" class to PDF element
    element.removeClass('print');

    // Save the PDF
    if (this.outputElement.length > 0) {
      this.outputElement.attr('src', this.jsPDF.output('datauristring'));
    } else {
      this.jsPDF.save((element.data('filename') ? element.data('filename') : 'please_set_a_filename') + '.pdf');
    }
  }
}
