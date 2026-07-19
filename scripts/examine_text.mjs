import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function main() {
    const dataBuffer = fs.readFileSync('./public/รายวิชา.pdf');
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    const lines = data.text.split('\n');
    for (let i = 0; i < 100; i++) {
        console.log(`${i}: ${lines[i]}`);
    }
}

main();
