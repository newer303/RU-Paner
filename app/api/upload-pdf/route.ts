import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text;

    // Regex to find RU course codes and optional grade/credit
    // Pattern: [CODE] [NAME...] [CREDIT] [GRADE]
    // Example: RAM1000  NAME...  3  A
    const lines = text.split('\n');
    const extractedData: any[] = [];
    const courseCodeRegex = /([A-Z]{3,4}[0-9]{4})\s+(.*?)\s+(\d)\s+([A-D][+]?|[FSU])/g;

    let match;
    while ((match = courseCodeRegex.exec(text)) !== null) {
      extractedData.push({
        code: match[1],
        name: match[2].trim(),
        credit: parseInt(match[3]),
        grade: match[4]
      });
    }
    
    // If no complex match, fallback to simple codes
    if (extractedData.length === 0) {
      const simpleRegex = /[A-Z]{3,4}[0-9]{4}/g;
      const simpleMatches = text.match(simpleRegex) || [];
      Array.from(new Set(simpleMatches)).forEach(code => {
        extractedData.push({ code, credit: 3, grade: 'A' });
      });
    }

    return NextResponse.json({ 
      courses: extractedData,
      count: extractedData.length
    });
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Failed to parse PDF', details: error.message }, { status: 500 });
  }
}
