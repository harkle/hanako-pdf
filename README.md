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

## Todo
- line height
- letter spacing
- image
- page break
- ul
- ol
- nested styles (em, strong, sup, etc.)
