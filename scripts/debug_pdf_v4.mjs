import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testGetTable() {
    const dataBuffer = fs.readFileSync('public/รายวิชา.pdf');

    try {
        const parser = new PDFParse({ data: dataBuffer });
        // Let's try first 2 pages
        const data = await parser.getTable({ first: 1, last: 2 });
        
        fs.writeFileSync('scripts/table_debug.json', JSON.stringify(data, null, 2));
        console.log('Table debug saved to scripts/table_debug.json');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testGetTable();
