import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Collection } from "hanako-ts/dist-legacy/Collection";
import { jsPDF, jsPDFOptions } from 'jspdf';

type Fonts = {
  [key: string]: string;
}

export class HanakoPDF {
  private static hasBeenInitialized: boolean = false;
  private static fonts: Fonts = {};
  private static jsPDF: jsPDF;

  /*
   * Load fonts from server
   */
  public static async init(path: string, fonts: string) {
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
    // Load fonts if not already loaded
    if (!this.hasBeenInitialized) await this.init(element.data('path'), element.data('fonts'));

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

    // Remove "print" class to PDF element
    element.removeClass('print');

    // Save the PDF
    this.jsPDF.save((element.data('filename') ? element.data('filename') : 'please_set_a_filename') + '.pdf');
  }
}
