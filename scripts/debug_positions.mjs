import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function render_page(pageData) {
    let render_options = {
        normalizeWhitespace: true,
        disableCombineTextItems: false
    }

    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let items = textContent.items.map(item => ({
            str: item.str,
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5])
        }));
        
        // Group by Y coordinate (with some tolerance)
        let rows = [];
        let tolerance = 2;
        
        items.sort((a, b) => b.y - a.y || a.x - b.x);
        
        let currentRow = [];
        let lastY = -1;
        
        for (let item of items) {
            if (lastY === -1 || Math.abs(item.y - lastY) <= tolerance) {
                currentRow.push(item);
                lastY = item.y;
            } else {
                rows.push(currentRow);
                currentRow = [item];
                lastY = item.y;
            }
        }
        if (currentRow.length > 0) rows.push(currentRow);
        
        return rows.map(row => row.map(i => i.str).join(' | ')).join('\n');
    });
}

async function main() {
    const dataBuffer = fs.readFileSync('./public/รายวิชา.pdf');
    const options = {
        pagerender: render_page
    };
    const data = await pdf(dataBuffer, options);
    console.log(data.text.substring(0, 5000));
}

main();
