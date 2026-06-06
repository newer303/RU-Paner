import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testTable() {
    const dataBuffer = fs.readFileSync('public/รายวิชา.pdf');
    try {
        const parser = new PDFParse({ data: dataBuffer });
        // Just try the first 5 pages to see if it works
        const data = await parser.getTable({ partial: true, first: 1, last: 5 });
        console.log(JSON.stringify(data.pages[0], null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}
testTable();
