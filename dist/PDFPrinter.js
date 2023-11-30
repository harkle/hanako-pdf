import { $ } from 'hanako-ts/dist-legacy/Framework';
import { HanakoPDF } from './HanakoPDF';
import { PDFElement } from './PDFElement';
export class PDFPrinter {
    static init(jsPDF) {
        this.jsPDF = jsPDF;
    }
    /*
     * Draw page number
     */
    static pageNumber() {
        let pageNumberElement = HanakoPDF.page.find('.hp-page-number');
        if (pageNumberElement.length === 0) {
            pageNumberElement = $.parseHTML('<div class="hp-page-number d-none"></div>');
            HanakoPDF.page.append(pageNumberElement);
        }
        const pageNumberText = HanakoPDF.pageNumberOptions.format.replace('{page}', HanakoPDF.currentPage.toString()).replace('{pages}', HanakoPDF.pageCount.toString());
        PDFPrinter.text(new PDFElement(pageNumberElement), HanakoPDF.pageNumberOptions.x, HanakoPDF.pageNumberOptions.y, pageNumberText, HanakoPDF.pageNumberOptions.align);
    }
    /*
     * Draw a text
     */
    static text(element, x, y, altText, options) {
        // Font familiy, weight and style
        const fontFamiliy = element.element.css('font-family').replace(/"/g, '').replace(/'/g, '').split(',')[0].trim();
        const fontWeight = element.element.css('font-weight');
        const fontStyle = element.element.css('font-style');
        this.jsPDF.setFont(fontFamiliy + ' ' + fontWeight + ' ' + fontStyle);
        // Font size
        const fontSize = parseFloat(element.element.css('font-size')) / HanakoPDF.fontScaleFactor;
        const fontOffset = fontSize * 0.03528;
        this.jsPDF.setFontSize(fontSize);
        // Line height
        const lineHeight = parseFloat(element.element.css('line-height')) / parseFloat(element.element.css('font-size'));
        this.jsPDF.setLineHeightFactor(lineHeight);
        // Letter spacing
        /*const letterSpacing = parseFloat(element.element.css('letter-spacing')) / parseFloat(element.element.css('font-size')) / 10;
        if (!isNaN(letterSpacing)) this.jsPDF.setCharSpace(letterSpacing);*/
        // Font color
        const fontColor = element.element.css('color');
        this.jsPDF.setTextColor(fontColor);
        //this.jsPDF.setCharSpace(-0.02);
        //this.jsPDF.setLineHeightFactor(1.2);
        const textWidth = element.width - element.padding.right - element.padding.left;
        const textHeight = element.height - element.padding.top - element.padding.bottom;
        const text = altText ? altText : this.jsPDF.splitTextToSize(element.element.get(0).innerText, textWidth);
        if (text !== '') {
            if (HanakoPDF.debug)
                PDFPrinter.rectangle(x + element.padding.left, y + element.padding.top, textWidth, textHeight, '#ff9900');
            this.jsPDF.text(text, x + element.padding.left, y + element.padding.top + fontOffset, options);
        }
    }
    /*
     * Draw a rectangle
     */
    static rectangle(x, y, width, height, strokeColor = '#0000', lineWidth = 0.025, fillColor) {
        this.jsPDF.setDrawColor(strokeColor);
        this.jsPDF.setLineWidth(lineWidth);
        if (fillColor)
            this.jsPDF.setFillColor(fillColor);
        let style = 'S';
        if (fillColor)
            style = 'FD';
        this.jsPDF.rect(x, y, width, height, style);
    }
    /*
     * Draw a line
     */
    static line(x1, y1, x2, y2, color = '#0000', lineWidth = 0.025) {
        this.jsPDF.setDrawColor(color);
        this.jsPDF.setLineWidth(lineWidth);
        this.jsPDF.line(x1, y1, x2, y2);
    }
    /*
     * Draw an image
      */
    static image(element, x, y) {
        if (HanakoPDF.debug)
            this.rectangle(x, y, element.width, element.height, '#ff00ff');
        const isCanvas = element.element.get(0).tagName === 'CANVAS';
        let src = element.element.attr('src');
        if (!src && !isCanvas)
            return;
        if (!src)
            src = '';
        const format = src.split('.').pop() === 'jpg' ? 'jpeg' : 'png';
        try {
            const image = isCanvas ? element.element.get(0) : this.imageToCanvas(element);
            this.jsPDF.addImage(image, format, x, y, element.element.width() * HanakoPDF.scaleFactor, element.element.height() * HanakoPDF.scaleFactor);
        }
        catch (e) {
            console.error('Failed to add image to PDF: ' + src);
        }
    }
    /*
     * Draw a link
     */
    static link(element, x, y) {
        const link = element.element.attr('href');
        const fontColor = element.element.css('color');
        this.jsPDF.setTextColor(fontColor);
        this.jsPDF.link(x, y, element.element.width() * HanakoPDF.scaleFactor, element.element.height() * HanakoPDF.scaleFactor, { url: link });
        const lineTop = y + parseFloat(element.element.css('font-size')) * 1.1 * HanakoPDF.scaleFactor;
        PDFPrinter.line(x, lineTop, x + element.element.width() * HanakoPDF.scaleFactor, lineTop, fontColor);
    }
    /*
     * Background image to canvas
     */
    static backgroundImageToCanvas(element) {
        const canvas = document.createElement('canvas');
        const image = element.element.css('background-image').replace('url("', '').replace('")', '');
        canvas.width = element.element.width() * 2;
        canvas.height = element.element.height() * 2;
        const context = canvas.getContext('2d');
        context.scale(2, 2);
        if (element.element.css('background-color') !== 'rgba(0, 0, 0, 0)') {
            context.fillStyle = element.element.css('background-color');
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        const img = new Image();
        img.src = image;
        context.drawImage(img, 0, 0, element.element.width(), element.element.height());
        return canvas;
    }
    /*
     * Transform image to canvas
     */
    static imageToCanvas(element) {
        const canvas = document.createElement('canvas');
        const image = element.element.get(0);
        canvas.width = image.width * 2;
        canvas.height = image.height * 2;
        const context = canvas.getContext('2d');
        context.scale(2, 2);
        if (element.element.css('background-color') !== 'rgba(0, 0, 0, 0)') {
            context.fillStyle = element.element.css('background-color');
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0, image.width, image.height);
        return canvas;
    }
}
