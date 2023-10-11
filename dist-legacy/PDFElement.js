import { HanakoPDF } from './HanakoPDF';
export class PDFElement {
    constructor(element) {
        this._element = element;
    }
    /*
     * Getter for element
     */
    get element() {
        return this._element;
    }
    /*
     * Getter for x
     */
    get x() {
        return this._element.position(HanakoPDF.page).x * HanakoPDF.scaleFactor;
    }
    /*
     * Getter for y
     */
    get y() {
        return (this._element.position(HanakoPDF.page).y - HanakoPDF.yReference) * HanakoPDF.scaleFactor;
    }
    /*
     * Getter for width
     */
    get width() {
        return this._element.width() * HanakoPDF.scaleFactor;
    }
    /*
     * Getter for height
     */
    get height() {
        return this._element.height() * HanakoPDF.scaleFactor;
    }
    /*
     * Getter for padding
     */
    get padding() {
        return {
            top: parseFloat(this._element.css('padding-top')) * HanakoPDF.scaleFactor,
            right: parseFloat(this._element.css('padding-right')) * HanakoPDF.scaleFactor,
            bottom: parseFloat(this._element.css('padding-bottom')) * HanakoPDF.scaleFactor,
            left: parseFloat(this._element.css('padding-left')) * HanakoPDF.scaleFactor
        };
    }
    /*
     * Return if element is excluded
    */
    isExcluded() {
        return (this._element.hasClass('d-none') || this._element.parents('.d-none').length > 0);
    }
    /*
     * Return if element is below page bottom
     */
    checkPageBreak() {
        return this.y + this.height > HanakoPDF.pageBottom || this.getGroupLimt() > HanakoPDF.pageBottom || this._element.hasClass('hp-page-break');
    }
    /*
     * Return element group limit
     */
    getGroupLimt() {
        let group = this._element.parents('.hp-group');
        return group.length > 0 ? (group.position(HanakoPDF.page).y - HanakoPDF.yReference) * HanakoPDF.scaleFactor + group.height() * HanakoPDF.scaleFactor : 0;
    }
}
