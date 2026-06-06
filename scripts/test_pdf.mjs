import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function test() {
    const dataBuffer = fs.readFileSync('public/รายวิชา.pdf');
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        console.log(data.text.substring(0, 2000));
    } catch (error) {
        console.error('Error:', error);
    }
}
test();
