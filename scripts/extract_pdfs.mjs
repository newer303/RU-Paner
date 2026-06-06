import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function extractText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const info = await parser.getInfo();
        console.log(`File: ${filePath}, Pages: ${info.total}`);
        const textResult = await parser.getText();
        return textResult.text;
    } catch (error) {
        return `Error extracting ${filePath}: ${error.message}`;
    }
}

async function main() {
    const file1 = './public/ปฏิทินการศึกษา1.pdf';
    const file2 = './public/ปฏิทินการศึกษา2.pdf';

    console.log('--- START FILE 1: ปฏิทินการศึกษา1.pdf ---');
    const text1 = await extractText(file1);
    console.log(text1);
    console.log('--- END FILE 1 ---');

    console.log('\n--- START FILE 2: ปฏิทินการศึกษา2.pdf ---');
    const text2 = await extractText(file2);
    console.log(text2);
    console.log('--- END FILE 2 ---');
}

main();
