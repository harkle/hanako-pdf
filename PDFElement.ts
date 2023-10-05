import { Collection } from "hanako-ts/dist-legacy/Collection";
import { HanakoPDF } from './HanakoPDF';

export class PDFElement {
  private element: Collection;

  constructor(element: Collection) {
    this.element = element;
  }

  /*
   * Getter for x
   */
  public get x() {
    return this.element.position(HanakoPDF.page).x * HanakoPDF.scaleFactor;
  }

  /*
   * Getter for y
   */
  public get y() {
    return (this.element.position(HanakoPDF.page).y - HanakoPDF.yReference) * HanakoPDF.scaleFactor;
  }

  /*
   * Getter for width
   */
  public get width() {
    return this.element.width() * HanakoPDF.scaleFactor;
  }

  /*
   * Getter for height
   */
  public get height() {
    return this.element.height() * HanakoPDF.scaleFactor;
  }

  /*
   * Return if element is excluded
  */
  public isExcluded() {
    return (this.element.hasClass('d-none') || this.element.parents('.d-none').length > 0);
  }

  /*
   * Return if element is below page bottom
   */
  public checkPageBreak() {
    return this.y + this.height > HanakoPDF.pageBottom || this.getGroupLimt() > HanakoPDF.pageBottom || this.element.hasClass('export-page-break');
  }

  /*
   * Return element group limit
   */
  private getGroupLimt() {
    let group = this.element.parents('.hp-group');

    return group.length > 0 ? (group.position(HanakoPDF.page).y - HanakoPDF.yReference) * HanakoPDF.scaleFactor + group.height() * HanakoPDF.scaleFactor : 0;
  }
}
