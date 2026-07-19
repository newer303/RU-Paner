import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function main() {
    const dataBuffer = fs.readFileSync('./public/รายวิชา.pdf');
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    const text = data.text;
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    console.log('Total lines:', lines.length);
    
    const courseCodes = lines.filter(l => /^[A-Z]{3,4}[0-9]{4} \(\d\)$/.test(l));
    const examDates = lines.filter(l => /^(S|SUN|M|TU|W|TH|F) \d{1,2} [A-Z]{3}\.? \d{4} [AB]$/.test(l));
    const times = lines.filter(l => /^(M|TU|W|TH|F|S|SUN) \d{4}-\d{4}$/.test(l));
    
    console.log('Course codes found:', courseCodes.length);
    console.log('Exam dates found:', examDates.length);
    console.log('Times found:', times.length);
    
    console.log('--- Samples ---');
    console.log('Codes:', courseCodes.slice(0, 5));
    console.log('Exam Dates:', examDates.slice(0, 5));
    console.log('Times:', times.slice(0, 5));
}

main();
