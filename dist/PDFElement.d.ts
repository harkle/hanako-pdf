import { Collection } from "hanako-ts/dist-legacy/Collection";
export declare class PDFElement {
    private _element;
    constructor(element: Collection);
    get element(): Collection;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    get padding(): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    isExcluded(): boolean;
    checkPageBreak(): boolean;
    private getGroupLimt;
}
