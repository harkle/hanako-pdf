import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Collection } from "hanako-ts/dist-legacy/Collection";
import { jsPDF, jsPDFOptions } from 'jspdf';
import { PDFElement } from './PDFElement';

type Fonts = {
  [key: string]: string;
};

export class HanakoPDF {
  private static hasBeenInitialized: boolean = false;
  private static debug: boolean = false;
  private static fonts: Fonts = {};
  private static jsPDF: jsPDF;
  private static outputElement: Collection;
  private static pageCount: number = 1;
  private static _page: Collection;
  private static _scaleFactor: number;
  private static _yReference: number = 0;
  private static _pageBottom: number = 0;

  /*
   * Init & load fonts from server
   */
  public static async init() {
    let path = this.page.data('path');
    let fonts = this.page.data('fonts');

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
    this.debug = this.page.data('debug') === 'true';

    // Retrieve output element
    this.outputElement = $(this.page.data('output'));

    // Retrieve debug mode
    this._pageBottom = this.page.data('pageBottom') ? parseFloat(this.page.data('pageBottom')) : 29.7;

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
  public static async print(page: Collection, jsPDFOptions?: jsPDFOptions) {
    this._page = page;

    // Load fonts if not already loaded
    if (!this.hasBeenInitialized) await this.init();

    // Initialize jsPDF
    this.jsPDF = new jsPDF({
      ...{
        orientation: 'portrait',
        unit: 'cm',
        format: 'A4'
      },
      ...jsPDFOptions
    });

    // Add "print" class to PDF element (enable specific CSS rules for PDF)
    page.addClass('print');

    this.countPages();
    this.transverse();

    // Remove "print" class to PDF element
    page.removeClass('print');

    // Save the PDF
    if (this.outputElement.length > 0) {
      this.outputElement.attr('src', this.jsPDF.output('datauristring'));
    } else {
      this.jsPDF.save((page.data('filename') ? page.data('filename') : 'please_set_a_filename') + '.pdf');
    }
  }

  /*
   * Get page
   */
  public static get page() {
    return this._page;
  }

  /*
   * Get scale factor
   */
  public static get scaleFactor() {
    if (!this._scaleFactor) this._scaleFactor = 21 / this.page.width();

    return this._scaleFactor;
  }

  /*
   * Get y reference
  */
  public static get yReference() {
    return this._yReference;
  }

  /*
   * Get page
   */
  public static get pageBottom() {
    return this._pageBottom;
  }

  /*
   * Transverse element and count pages
   */
  private static countPages() {
    // Reset y reference
    this._yReference = 0;

    // Transverse elements
    this.page.find('.hp-export').each((element: Collection) => {
      const pdfElement = new PDFElement(element);

      // Skip excluded elements
      if (pdfElement.isExcluded()) return;

      // Check if element is below page limit
      if (pdfElement.checkPageBreak()) {
        this._yReference = element.position(this.page).y;

        this.pageCount++;
      }
    });
  }

  private static transverse() {
    console.log('hanako-pdf: transverse');
    console.log('hanako-pdf: page count: ' + this.pageCount);

    // Transverse elements
    this.page.find('.hp-export').each((element: Collection) => {
      console.log('hanako-pdf: transverse element', element);
    });
  }
}
