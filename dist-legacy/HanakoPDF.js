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
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const fontConfigs = yield $.httpRequest({
                url: fontPath + '/fonts.json',
                dataType: 'json'
            });
            yield Promise.all(fontConfigs.map((fontConfig, index) => __awaiter(this, void 0, void 0, function* () {
                const fontData = yield $.httpRequest({
                    url: fontPath + '/' + fontConfig.file,
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
    static print(page, jsPDFOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this._page = page;
            // Load fonts if not already loaded
            if (!this.hasBeenInitialized)
                yield this.init();
            if (!this.hasBeenInitialized)
                return false;
            // Initialize jsPDF
            this.jsPDF = new jsPDF(Object.assign({
                orientation: 'portrait',
                unit: 'cm',
                format: 'A4'
            }, jsPDFOptions));
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
            if (this.outputElement.length > 0) {
                this.outputElement.attr('src', this.jsPDF.output('datauristring'));
            }
            else {
                this.jsPDF.save((page.data('filename') ? page.data('filename') : 'please_set_a_filename') + '.pdf');
            }
        });
    }
    /*
     * Return page data attribute
     */
    static getPageDataAttribute(key, defaultValue = undefined) {
        return this.page.data(key) !== undefined ? this.page.data(key) : defaultValue;
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
        if (!this._scaleFactor)
            this._scaleFactor = 21 / this.page.width();
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
    static get pageNumberPosition() {
        return this._pageNumberPosition;
    }
    /*
     * Get page number parameters
     */
    static get fontScaleFactor() {
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
        this.page.find('.hp-export').each((element) => {
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
            PDFPrinter.rectangle(element.x, this._pageTop + element.y, element.width, element.height, element.element.css('background-color'), 0, element.element.css('background-color'));
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
                y2: this._pageTop + element.y
            };
            if (border === 'border-right') {
                lineCoordinates.x1 = lineCoordinates.x2 = element.x + element.width;
                lineCoordinates.y2 = this._pageTop + element.y + element.height;
            }
            if (border === 'border-bottom') {
                lineCoordinates.y1 = lineCoordinates.y2 = this._pageTop + element.y + element.height;
            }
            if (border === 'border-left') {
                lineCoordinates.x2 = lineCoordinates.x1;
                lineCoordinates.y2 = this._pageTop + element.y + element.height;
            }
            if (borderSize > 0 && borderStyle != 'none')
                PDFPrinter.line(lineCoordinates.x1, lineCoordinates.y1, lineCoordinates.x2, lineCoordinates.y2, borderColor, borderSize * this.scaleFactor);
        });
        // Draw image
        if (['CANVAS', 'IMG'].includes(element.element.get(0).tagName) || element.element.css('background-image') !== 'none')
            PDFPrinter.image(element, element.x, this._pageTop + element.y);
        // Output text
        if (element.element.text() !== '' && element.element.find('.hp-export').length === 0)
            PDFPrinter.text(element, element.x, this._pageTop + element.y);
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
HanakoPDF.hasBeenInitialized = false;
HanakoPDF.currentPageTop = 0;
HanakoPDF._debug = false;
HanakoPDF.fonts = {};
HanakoPDF._pageCount = 1;
HanakoPDF._currentPage = 1;
HanakoPDF._pageTop = 0;
HanakoPDF._pageBottom = 0;
HanakoPDF._fontScaleFactor = 1.5;
HanakoPDF._yReference = 0;
