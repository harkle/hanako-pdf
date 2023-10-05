import { $ } from 'hanako-ts/dist-legacy/Framework';
import { Collection } from "hanako-ts/dist-legacy/Collection";
import { jsPDF } from 'jspdf';
import { HanakoPDF } from './HanakoPDF';
import { PDFElement } from './PDFElement';

export class PDFPrinter {
  private static jsPDF: jsPDF;

  public static init(jsPDF: jsPDF) {
    this.jsPDF = jsPDF;
  }

  /*
   * Draw page number
   */
  public static pageNumber() {
    let pageNumberElement = HanakoPDF.page.find('.hp-page-number');

    if (pageNumberElement.length === 0) {
      pageNumberElement = $.parseHTML('<div class="hp-page-number d-none"></div>');
      HanakoPDF.page.append(pageNumberElement);
    }

    PDFPrinter.text(new PDFElement(pageNumberElement), HanakoPDF.pageNumberPosition.x, HanakoPDF.pageNumberPosition.y, HanakoPDF.currentPage + '/' + HanakoPDF.pageCount, HanakoPDF.pageNumberPosition.align);
  }

  /*
   * Draw a text
   */ 
  public static text(element: PDFElement, x: number, y: number, altText?: string, options?: any) {
    const fontSize = parseFloat(element.element.css('font-size')) / HanakoPDF.fontScaleFactor;
    const fontOffset = fontSize * 0.03528;

    this.jsPDF.setFontSize(fontSize);
    //this.jsPDF.setCharSpace(-0.02);
    //this.jsPDF.setLineHeightFactor(1.2);

    const textWidth = element.width - element.padding.x;
    const textHeight = element.height - element.padding.y;

    const text = altText ? altText : this.jsPDF.splitTextToSize(element.element.get(0).innerText, textWidth);
    
    if (text !== '') this.jsPDF.text(text, x + element.padding.left, y + element.padding.top + fontOffset, options);
  }
}
