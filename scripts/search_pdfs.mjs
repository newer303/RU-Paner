import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function searchInPdf(filePath, searchTerm) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;
        if (text.includes(searchTerm)) {
            console.log(`Found "${searchTerm}" in ${filePath}`);
            // Find context
            const index = text.indexOf(searchTerm);
            console.log('Context:', text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100)));
        } else {
            console.log(`"${searchTerm}" not found in ${filePath}`);
        }
    } catch (error) {
        console.error(`Error searching in ${filePath}:`, error);
    }
}

async function main() {
    const files = ['./public/ปฏิทินการศึกษา1.pdf', './public/ปฏิทินการศึกษา2.pdf', './public/รายวิชา.pdf'];
    for (const file of files) {
        await searchInPdf(file, 'ภูมิภาค');
    }
}

main();
