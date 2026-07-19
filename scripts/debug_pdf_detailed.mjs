import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function extractText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        // Save first 10 pages worth of text to analyze patterns
        fs.writeFileSync('scripts/pdf_structure_detailed.txt', data.text);
        console.log('Saved full text to scripts/pdf_structure_detailed.txt');
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
    }
}

extractText('public/รายวิชา.pdf');
