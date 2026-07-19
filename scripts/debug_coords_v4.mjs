import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function debugCoordinates() {
    const dataBuffer = fs.readFileSync('public/รายวิชา.pdf');

    function render_page(pageData) {
        return pageData.getTextContent()
        .then(function(textContent) {
            let items = textContent.items.map(item => ({
                str: item.str,
                x: item.transform[4],
                y: item.transform[5],
                w: item.width,
                h: item.height
            }));
            return JSON.stringify(items, null, 2);
        });
    }

    let options = {
        pagerender: render_page,
        max: 1 // Only first page
    }

    const data = await pdf(dataBuffer, options);
    fs.writeFileSync('scripts/pdf_coordinates_debug.json', data.text);
    console.log('Coordinates debug saved to scripts/pdf_coordinates_debug.json');
}

debugCoordinates();
