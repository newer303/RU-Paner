import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function parseCourses() {
    const pdfPath = 'public/รายวิชา.pdf';
    const outputPath = 'scripts/courses_data.json';

    console.log(`Reading and parsing ${pdfPath}...`);
    const dataBuffer = fs.readFileSync(pdfPath);
    
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        const fullText = data.text;

        const pages = fullText.split(/Page \d+ of \d+/);
        console.log(`Processing ${pages.length} potential pages...`);

        const allCourses = [];

        for (let i = 0; i < pages.length; i++) {
            const pageText = pages[i];
            const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            if (lines.length < 10) continue;

            const codes = [];
            const exams = [];
            const timeRows = [];
            const roomRows = [];
            const instructorRows = [];
            const nameBlocks = [];
            const sectionMarkers = [];

            const codeRegex = /^([A-Z]{2,4}\d{4})\s*\((\d)\)$/;
            const examRegex = /^(?:S|SUN|M|TU|W|TH|F)\s+\d{1,2}\s+[A-Z]+\.?\s+\d{4}\s+[AB]$|^คณะจัดสอบเอง$/;
            const timeRegex = /^[A-Z]+\s+\d{4}-\d{4}$|^ไมมีบรรยาย$|^VDO\.$|^CONTACT\s+INSTRUCTOR$/;
            const roomRegex = /^[A-Z]{2,3}\s?\d{3}.*|^หองปฏิบัติการ.*|^VKB.*|^ITSC.*|^--$/;
            const secMarkerRegex = /^SEC\.$|^LEC\.$|^LAB\.$/;

            // Pass 1: Categorize lines
            let inNames = false;
            let currentName = "";
            
            for (const line of lines) {
                if (codeRegex.test(line)) {
                    const match = line.match(codeRegex);
                    codes.push({ code: match[1], credit: parseInt(match[2]) });
                    continue;
                }
                if (examRegex.test(line)) {
                    if (currentName) {
                        nameBlocks.push(currentName.trim());
                        currentName = "";
                    }
                    exams.push(line);
                    continue;
                }
                if (timeRegex.test(line)) {
                    timeRows.push(line);
                    continue;
                }
                if (roomRegex.test(line) && !timeRegex.test(line)) {
                    roomRows.push(line);
                    continue;
                }
                if (secMarkerRegex.test(line)) {
                    sectionMarkers.push(line);
                    continue;
                }
                
                // Heuristic for name/description
                if (codes.length > 0 && exams.length === 0) {
                    currentName += " " + line;
                }
            }

            const nCourses = codes.length;
            if (nCourses === 0) continue;

            // Step 6: Smart Association
            // If sectionMarkers > 0, we can use them to know how many rows per course.
            // But sometimes sectionMarkers are just numbers on separate lines.
            
            // Fallback: If total rows is a multiple of nCourses, use that.
            // Otherwise, use 1 row per course and log warning.
            
            let rowsPerCourse = Array(nCourses).fill(1);
            if (timeRows.length > nCourses) {
                // Try to find if some courses have SEC 1, SEC 2
                // On Page 1, we have 14 codes and 19 times.
                // 19 - 14 = 5 extra rows.
                // If we found "SEC." multiple times, it might explain.
                
                // Simplest heuristic: All extra rows belong to the first course(s) until we hit numRows.
                // Or better: Just use 1 row for now but make sure we don't misalign.
            }

            for (let j = 0; j < Math.min(nCourses, nameBlocks.length, exams.length); j++) {
                allCourses.push({
                    code: codes[j].code,
                    name: nameBlocks[j],
                    credit: codes[j].credit,
                    dayTime: timeRows[j] || 'N/A',
                    exam: exams[j],
                    room: roomRows[j] || 'N/A'
                });
            }
        }

        fs.writeFileSync(outputPath, JSON.stringify(allCourses, null, 2));
        console.log(`Successfully extracted ${allCourses.length} courses to ${outputPath}`);

    } catch (error) {
        console.error('Error during PDF parsing:', error);
    }
}

parseCourses();
