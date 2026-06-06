import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function extractText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        return data.text;
    } catch (error) {
        return `Error extracting ${filePath}: ${error.message}`;
    }
}

async function main() {
    const file = './public/รายวิชา.pdf';
    console.log(`--- START FILE: ${file} ---`);
    const text = await extractText(file);
    console.log(text.substring(0, 2000));
    console.log('--- END SAMPLE ---');
}

main();
