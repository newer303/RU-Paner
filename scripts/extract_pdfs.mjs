import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function extractText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
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
