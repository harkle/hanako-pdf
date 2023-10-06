import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Collection } from "hanako-ts/dist-legacy/Collection";
import { jsPDF, jsPDFOptions } from 'jspdf';
import { PDFElement } from './PDFElement';
import { PDFPrinter } from './PDFPrinter';

type FontConfig = {
  key: string;
  file: string;
};

type Fonts = {
  [key: string]: string;
};

type PageNumberPosition = {
  x: number;
  y: number;
  align: string;
};

export class HanakoPDF {
  private static hasBeenInitialized: boolean = false;
  private static currentPageTop: number = 0;
  private static _debug: boolean = false;
  private static displayMode: string;
  private static fonts: Fonts = {};
  private static jsPDF: jsPDF;
  private static outputElement: Collection;
  private static _pageCount: number = 1;
  private static _currentPage: number = 1;
  private static _page: Collection;
  private static _pageTop: number = 0;
  private static _pageBottom: number = 0;
  private static _pageNumberPosition: PageNumberPosition;
  private static _scaleFactor: number;
  private static _fontScaleFactor: number = 1.5;
  private static _yReference: number = 0;

  /*
   * Init & load fonts from server
   */
  public static async init() {
    let fontPath = this.getPageDataAttribute('fontPath');

    // Output an error if path is empty
    if (fontPath === '' || fontPath === undefined) {
      console.error('hanako-pdf: path is empty');
      return false;
    }

    // Retrieve debug mode
    this._debug = this.getPageDataAttribute('debug') === 'true';

    // Retrieve output element
    this.outputElement = $(this.getPageDataAttribute('output'));

    // Retrieve page top
    this._pageTop = parseFloat(this.getPageDataAttribute('pageTop', '0'));

    // Retrieve page bottom
    this._pageBottom = parseFloat(this.getPageDataAttribute('pageBottom', '29.7'));

    // Retrieve display mode
    this.displayMode = this.getPageDataAttribute('displayMode', 'fullheight');

    // Retrieve font scale factor
    this._fontScaleFactor = parseFloat(this.getPageDataAttribute('fontScaleFactor', '1.5'));

    // Retrieve page number position
    this._pageNumberPosition = {
      x: parseFloat(this.getPageDataAttribute('pageNumberX', '10.5')),
      y: parseFloat(this.getPageDataAttribute('pageNumberY', '28.5')),
      align: this.getPageDataAttribute('pageNumberAlign', 'center')
    };

    // Load fonts
    const fontConfigs: FontConfig[] = await $.httpRequest({
      url: fontPath + '/fonts.json',
      dataType: 'json'
    });

    await Promise.all(fontConfigs.map(async (fontConfig: FontConfig, index: number) => {
      const fontData: string = await $.httpRequest({
        url: fontPath + '/' + fontConfig.file,
        dataType: 'text'
      });

      this.fonts[fontConfig.key] = fontData;
    }));

    return this.hasBeenInitialized = true;
  }

  /*
   * Export PDF
   */
  public static async print(page: Collection, jsPDFOptions?: jsPDFOptions) {
    this._page = page;

    // Load fonts if not already loaded
    if (!this.hasBeenInitialized) await this.init();
    if (!this.hasBeenInitialized) return false;

    // Initialize jsPDF
    this.jsPDF = new jsPDF({
      ...{
        orientation: 'portrait',
        unit: 'cm',
        format: 'A4'
      },
      ...jsPDFOptions
    });

    // Set display mode
    this.jsPDF.setDisplayMode(this.displayMode);

    // Add fonts to VFS
    for (let fontName in this.fonts) {
      this.jsPDF.addFileToVFS(fontName + '.ttf', this.fonts[fontName]);
      this.jsPDF.addFont(fontName + '.ttf', fontName, 'normal');
    }

    // Set default font
    this.jsPDF.setFont(this.fonts[0]);

    // Add "print" class to PDF element (enable specific CSS rules for PDF)
    page.addClass('print');

    // Setup PDFPrinter
    PDFPrinter.init(this.jsPDF);

    // Count pages
    this.transverse(null, () => {
      this._pageCount++;
    });

    PDFPrinter.pageNumber();

    // Transverse page elements
    this.transverse((element: PDFElement) => {
      this.printElement(element);
    }, (element: Collection) => {
      this.pageBreak(element);
    });

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
   * Return page data attribute
   */
  private static getPageDataAttribute(key: string, defaultValue: string = undefined) {
    return this.page.data(key) !== undefined ? this.page.data(key) : defaultValue;
  }

  /*
   * Get debug
   */
  public static get debug() {
    return this._debug;
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
   * Get current page number
   */
  public static get currentPage() {
    return this._currentPage;
  }

  /*
   * Get page count
   */
  public static get pageCount() {
    return this._pageCount;
  }

  /*
   * Get page number parameters
   */
  public static get pageNumberPosition() {
    return this._pageNumberPosition;
  }

  /*
   * Get page number parameters
   */
  public static get fontScaleFactor() {
    return this._fontScaleFactor;
  }

  /*
   * Transverse elements
   */
  private static transverse(callback: Function, pageBreakCallback?: Function) {
    // Reset some values
    this.currentPageTop = 0;
    this._yReference = 0;
    this._currentPage = 1;

    this.page.find('.hp-export').each((element: Collection) => {
      const pdfElement = new PDFElement(element);

      // Check if element is below page limit
      if (pdfElement.checkPageBreak()) {
        // Update some references
        this.currentPageTop = this._pageTop;
        this._yReference = element.position(this.page).y;

        if (pageBreakCallback) pageBreakCallback(element);
      }

      if (callback) callback(pdfElement);
    });
  }

  /*
   * Print element to PDF
   */
  private static printElement(element: PDFElement) {
    // Draw background
    if (element.element.css('background-color') !== 'rgba(0, 0, 0, 0)') PDFPrinter.rectangle(element.x, this._pageTop + element.y, element.width, element.height, element.element.css('background-color'), 0, element.element.css('background-color'));

    // Output text
    if (element.element.text() !== '' && element.element.find('.hp-export').length === 0) PDFPrinter.text(element, element.x, this._pageTop + element.y);
  }

  /*
   * Add a new page
   */
  private static pageBreak(element: Collection) {
    // Add a new page
    this.jsPDF.addPage();

    // Update page number
    this._currentPage++;

    // Print page number to PDF
    PDFPrinter.pageNumber();
  }
}
