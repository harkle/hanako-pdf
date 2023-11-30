import { jsPDF } from 'jspdf';
import { PDFElement } from './PDFElement';
export declare class PDFPrinter {
    private static jsPDF;
    static init(jsPDF: jsPDF): void;
    static pageNumber(): void;
    static text(element: PDFElement, x: number, y: number, altText?: string, options?: any): void;
    static rectangle(x: number, y: number, width: number, height: number, strokeColor?: string, lineWidth?: number, fillColor?: string): void;
    static line(x1: number, y1: number, x2: number, y2: number, color?: string, lineWidth?: number): void;
    static image(element: PDFElement, x: number, y: number): void;
    static link(element: PDFElement, x: number, y: number): void;
    static backgroundImageToCanvas(element: PDFElement): HTMLCanvasElement;
    static imageToCanvas(element: PDFElement): HTMLCanvasElement;
}
