# Hanako PDF
A brute force HTML to PDF script.

## Installation

```bash
npm install hanako-ts --save
npm install jspdf --save
```

## Usage
```javascript
import { HanakoPDF } from '...';

HanakoPDF.print(hanakoCollectionElement, options?);
```

## Tips & Tricks

### Font converter

https://www.giftofspeed.com/base64-encoder/

## Not supported

These features are not support because they are causing issues with the PDF rendering.

- letter spacing
- background images
- external images
- sup, sub
- strong, em, etc. nested inside elements

## Todo
- callback system for special elements rendering
