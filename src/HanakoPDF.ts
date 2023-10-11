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

export type PageNumberOptions = {
  format: string;
  x: number;
  y: number;
  align: string;
};

export type HanakoPDFOptions = {
  fontPath: string;
  selector?: string;
  filename?: string;
  pageTop?: number;
  pageBottom?: number;
  displayMode?: string;
  pageNumberOptions?: PageNumberOptions;
  debug?: boolean;
};

export class HanakoPDF {
  private static currentPageTop: number = 0;
  private static displayMode: string;
  private static filename: string;
  private static fonts: Fonts = {};
  private static hasBeenInitialized: boolean = false;
  private static jsPDF: jsPDF;
  private static pageFormat: string = 'A4';
  private static pageWidth: number = 0;
  private static selector: string;
  private static _currentPage: number = 1;
  private static _debug: boolean;
  private static _fontScaleFactor: number = 1.5;
  private static _page: Collection;
  private static _pageCount: number = 1;
  private static _pageBottom: number = 0;
  private static _pageTop: number = 0;
  private static _pageNumberOptions: PageNumberOptions;
  private static _scaleFactor: number;
  private static _yReference: number = 0;

  /*
   * Init & load fonts from server
   */
  public static async init(options: HanakoPDFOptions) {
    // Output an error if path is empty
    if (options.fontPath === '' || options.fontPath === undefined) {
      console.error('hanako-pdf: path is empty');
      return false;
    }

    // Retrive options
    this.selector = options.selector ? options.selector : '.hp-export';
    this.filename = options.filename ? options.filename : 'please_set_a_filename';
    this._pageTop = options.pageTop ? options.pageTop : 0;
    this._pageBottom = options.pageBottom ? options.pageBottom : 29.7;
    this.displayMode = options.displayMode ? options.displayMode :'fullheight';
    this._pageNumberOptions =  options.pageNumberOptions ? options.pageNumberOptions : {
      format: ' {current} / {total}',
      x: 10.5,
      y: 28.5,
      align: 'center'
    };
    this._debug = options.debug ? options.debug : false;

    // Load fonts
    const fontConfigs: FontConfig[] = await $.httpRequest({
      url: options.fontPath + '/fonts.json',
      dataType: 'json'
    });

    await Promise.all(fontConfigs.map(async (fontConfig: FontConfig, index: number) => {
      const fontData: string = await $.httpRequest({
        url: options.fontPath + '/' + fontConfig.file,
        dataType: 'text'
      });

      this.fonts[fontConfig.key] = fontData;
    }));

    return this.hasBeenInitialized = true;
  }

  /*
   * Export PDF
   */
  public static async print(page: Collection, options: HanakoPDFOptions, target?: Collection, jsPDFOptions?: jsPDFOptions) {
    this._page = page;

    // Load fonts if not already loaded
    if (!this.hasBeenInitialized) await this.init(options);
    if (!this.hasBeenInitialized) return false;

    // Initialize jsPDF
    const _jsPDFOptions: jsPDFOptions = {
      ...{
        orientation: 'portrait',
        unit: 'cm',
        format: 'A4'
      },
      ...jsPDFOptions
    };
    this.jsPDF = new jsPDF(_jsPDFOptions);

    // Save page format
    this.pageFormat = <string>_jsPDFOptions.format;

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
    if (target) {
      target.attr('src', this.jsPDF.output('datauristring'));
    } else {
      this.jsPDF.save(this.filename);
    }
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
    if (!this._scaleFactor || this.pageWidth === this.page.width()) {
      const withCentimeters = this.pageFormat == 'A4' ? 21 : 29.7;
      this.pageWidth = this.page.width();
      this._fontScaleFactor = null;
      this._scaleFactor = withCentimeters / this.page.width();
    }

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
  public static get pageNumberOptions() {
    return this._pageNumberOptions;
  }

  /*
   * Get page number parameters
   */
  public static get fontScaleFactor() {
    if (!this._fontScaleFactor || this.pageWidth === this.page.width()) {
      this.pageWidth = this.page.width();
      this._fontScaleFactor = 0.03528 / this.scaleFactor;
    }
    
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

    this.page.find(this.selector).each((element: Collection) => {
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
    if (element.element.css('background-color') !== 'rgba(0, 0, 0, 0)') PDFPrinter.rectangle(element.x, this.currentPageTop + element.y, element.width, element.height, element.element.css('background-color'), 0, element.element.css('background-color'));

    // Draw border
    ['border-top', 'border-right', 'border-bottom', 'border-left'].forEach((border: string) => {
      const borderData = element.element.css(border);
      const borderSize = parseFloat(borderData.substring(0, borderData.indexOf('px')));
      const borderStyle = borderData.substring(borderData.indexOf('px') + 2, borderData.indexOf('rgb')).trim();
      const borderColor = borderData.substring(borderData.indexOf('rgb'), borderData.length);

      let lineCoordinates = {
        x1: element.x,
        y1: this.currentPageTop + element.y,
        x2: element.x + element.width,
        y2: this.currentPageTop + element.y
      };

      if (border === 'border-right') {
        lineCoordinates.x1 = lineCoordinates.x2 = element.x + element.width;
        lineCoordinates.y2 = this.currentPageTop + element.y + element.height;
      }

      if (border === 'border-bottom') {
        lineCoordinates.y1 = lineCoordinates.y2 = this.currentPageTop + element.y + element.height;
      }

      if (border === 'border-left') {
          lineCoordinates.x2 = lineCoordinates.x1;
          lineCoordinates.y2 = this.currentPageTop + element.y + element.height;
      }

      if (borderSize > 0 && borderStyle !=  'none') PDFPrinter.line(lineCoordinates.x1, lineCoordinates.y1, lineCoordinates.x2, lineCoordinates.y2, borderColor, borderSize * this.scaleFactor);
    });

    // Draw image
    if (['CANVAS', 'IMG'].includes(element.element.get(0).tagName) || element.element.css('background-image') !== 'none') PDFPrinter.image(element, element.x, this.currentPageTop + element.y);

    // Output text
    if (element.element.text() !== '' && element.element.find(this.selector).length === 0) PDFPrinter.text(element, element.x, this.currentPageTop + element.y);
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
