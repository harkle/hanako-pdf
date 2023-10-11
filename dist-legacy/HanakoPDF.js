var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $ } from 'hanako-ts/dist-legacy/Framework';
import { jsPDF } from 'jspdf';
import { PDFElement } from './PDFElement';
import { PDFPrinter } from './PDFPrinter';
export class HanakoPDF {
    /*
     * Init & load fonts from server
     */
    static init(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.displayMode = options.displayMode ? options.displayMode : 'fullheight';
            this._pageNumberOptions = options.pageNumberOptions ? options.pageNumberOptions : {
                format: ' {current} / {total}',
                x: 10.5,
                y: 28.5,
                align: 'center'
            };
            this._debug = options.debug ? options.debug : false;
            // Load fonts
            const fontConfigs = yield $.httpRequest({
                url: options.fontPath + '/fonts.json',
                dataType: 'json'
            });
            yield Promise.all(fontConfigs.map((fontConfig, index) => __awaiter(this, void 0, void 0, function* () {
                const fontData = yield $.httpRequest({
                    url: options.fontPath + '/' + fontConfig.file,
                    dataType: 'text'
                });
                this.fonts[fontConfig.key] = fontData;
            })));
            return this.hasBeenInitialized = true;
        });
    }
    /*
     * Export PDF
     */
    static print(page, options, target, jsPDFOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this._page = page;
            // Load fonts if not already loaded
            if (!this.hasBeenInitialized)
                yield this.init(options);
            if (!this.hasBeenInitialized)
                return false;
            // Initialize jsPDF
            const _jsPDFOptions = Object.assign({
                orientation: 'portrait',
                unit: 'cm',
                format: 'A4'
            }, jsPDFOptions);
            this.jsPDF = new jsPDF(_jsPDFOptions);
            // Save page format
            this.pageFormat = _jsPDFOptions.format;
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
            this.transverse((element) => {
                this.printElement(element);
            }, (element) => {
                this.pageBreak(element);
            });
            // Remove "print" class to PDF element
            page.removeClass('print');
            // Save the PDF
            if (target) {
                target.attr('src', this.jsPDF.output('datauristring'));
            }
            else {
                this.jsPDF.save(this.filename);
            }
        });
    }
    /*
     * Get debug
     */
    static get debug() {
        return this._debug;
    }
    /*
     * Get page
     */
    static get page() {
        return this._page;
    }
    /*
     * Get scale factor
     */
    static get scaleFactor() {
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
    static get yReference() {
        return this._yReference;
    }
    /*
     * Get page
     */
    static get pageBottom() {
        return this._pageBottom;
    }
    /*
     * Get current page number
     */
    static get currentPage() {
        return this._currentPage;
    }
    /*
     * Get page count
     */
    static get pageCount() {
        return this._pageCount;
    }
    /*
     * Get page number parameters
     */
    static get pageNumberOptions() {
        return this._pageNumberOptions;
    }
    /*
     * Get page number parameters
     */
    static get fontScaleFactor() {
        if (!this._fontScaleFactor || this.pageWidth === this.page.width()) {
            this.pageWidth = this.page.width();
            this._fontScaleFactor = 0.03528 / this.scaleFactor;
        }
        return this._fontScaleFactor;
    }
    /*
     * Transverse elements
     */
    static transverse(callback, pageBreakCallback) {
        // Reset some values
        this.currentPageTop = 0;
        this._yReference = 0;
        this._currentPage = 1;
        this.page.find(this.selector).each((element) => {
            const pdfElement = new PDFElement(element);
            // Check if element is below page limit
            if (pdfElement.checkPageBreak()) {
                // Update some references
                this.currentPageTop = this._pageTop;
                this._yReference = element.position(this.page).y;
                if (pageBreakCallback)
                    pageBreakCallback(element);
            }
            if (callback)
                callback(pdfElement);
        });
    }
    /*
     * Print element to PDF
     */
    static printElement(element) {
        // Draw background
        if (element.element.css('background-color') !== 'rgba(0, 0, 0, 0)')
            PDFPrinter.rectangle(element.x, this.currentPageTop + element.y, element.width, element.height, element.element.css('background-color'), 0, element.element.css('background-color'));
        // Draw border
        ['border-top', 'border-right', 'border-bottom', 'border-left'].forEach((border) => {
            const borderData = element.element.css(border);
            const borderSize = parseFloat(borderData.substring(0, borderData.indexOf('px')));
            const borderStyle = borderData.substring(borderData.indexOf('px') + 2, borderData.indexOf('rgb')).trim();
            const borderColor = borderData.substring(borderData.indexOf('rgb'), borderData.length);
            let lineCoordinates = {
                x1: element.x,
                y1: this._pageTop + element.y,
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
            if (borderSize > 0 && borderStyle != 'none')
                PDFPrinter.line(lineCoordinates.x1, lineCoordinates.y1, lineCoordinates.x2, lineCoordinates.y2, borderColor, borderSize * this.scaleFactor);
        });
        // Draw image
        if (['CANVAS', 'IMG'].includes(element.element.get(0).tagName) || element.element.css('background-image') !== 'none')
            PDFPrinter.image(element, element.x, this.currentPageTop + element.y);
        // Output text
        if (element.element.text() !== '' && element.element.find(this.selector).length === 0)
            PDFPrinter.text(element, element.x, this.currentPageTop + element.y);
    }
    /*
     * Add a new page
     */
    static pageBreak(element) {
        // Add a new page
        this.jsPDF.addPage();
        // Update page number
        this._currentPage++;
        // Print page number to PDF
        PDFPrinter.pageNumber();
    }
}
HanakoPDF.currentPageTop = 0;
HanakoPDF.fonts = {};
HanakoPDF.hasBeenInitialized = false;
HanakoPDF.pageFormat = 'A4';
HanakoPDF.pageWidth = 0;
HanakoPDF._currentPage = 1;
HanakoPDF._fontScaleFactor = 1.5;
HanakoPDF._pageCount = 1;
HanakoPDF._pageBottom = 0;
HanakoPDF._pageTop = 0;
HanakoPDF._yReference = 0;
