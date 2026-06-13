import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const userId = '67034526-e862-44e4-be6e-299316732d0a';

const allCourses = [
  { code: 'RAM1142', name: 'การพัฒนาคุณภาพชีวิตและสังคม', credit: 3, cat: 'general', grade: 'B' },
  { code: 'RAM1111', name: 'ภาษาอังกฤษในชีวิตประจำวัน', credit: 3, cat: 'general', grade: 'B+' },
  { code: 'RAM1132', name: 'ทักษะความเข้าใจและการใช้เทคโนโลยีดิจิทัล', credit: 3, cat: 'general', grade: 'B+' },
  { code: 'RAM1101', name: 'ทักษะการใช้ภาษาไทย', credit: 3, cat: 'general', grade: 'B' },
  { code: 'RAM1114', name: 'ภาษาและวัฒนธรรมญี่ปุ่น', credit: 3, cat: 'general', grade: 'F', reexam: true },
  { code: 'RAM1203', name: 'ศาสตร์การคิดเปลี่ยนโลก', credit: 3, cat: 'general', grade: 'D' },
  { code: 'RAM1212', name: 'ผู้ประกอบการรุ่นใหม่', credit: 3, cat: 'general', grade: 'D' },
  { code: 'RAM1301', name: 'คุณธรรมคู่ความรู้', credit: 3, cat: 'general', grade: 'A' },
  { code: 'RAM1302', name: 'การเมืองและกฎหมายในชีวิตประจำวัน', credit: 3, cat: 'general', grade: 'C+' },
  { code: 'RAM1312', name: 'วัฒนธรรมร่วมสมัยกับการเปลี่ยนฉับพลันทางดิจิทัล', credit: 3, cat: 'general', grade: 'C+' },
  { code: 'RAM1131', name: 'ทักษะการเข้าใจดิจิทัล', credit: 3, cat: 'general', grade: 'D+' },
  { code: 'COS4602', name: 'ความมั่นคงของเครือข่าย', credit: 3, cat: 'major', grade: 'B' },
  { code: 'MTH1101', name: 'แคลคูลัสและเลขาคณิตวิเคราะห์ 1', credit: 3, cat: 'core', grade: 'B' },
  { code: 'MTH1201', name: 'คณิตศาสตร์สำหรับวิทการคอมพิวเตอร์', credit: 3, cat: 'core', grade: 'F', reexam: true },
  { code: 'STA2003', name: 'หลักสถิติ', credit: 3, cat: 'core', grade: 'B' },
  { code: 'COS1102', name: 'โครงสร้างไม่ต่อเนื่อง', credit: 3, cat: 'core', grade: 'C+' },
  { code: 'COS3101', name: 'วิธีเชิงตัวเลข', credit: 3, cat: 'core', grade: 'A' },
  { code: 'COS1101', name: 'วิทยาการคอมพิวเตอร์เบื้องต้น', credit: 3, cat: 'core' },
  { code: 'COS2103', name: 'โครงสร้างข้อมูลและอัลกอริทึม', credit: 3, cat: 'core', grade: 'C+' },
  { code: 'COS2105', name: 'ทฤษฎีการคำนวณ', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS3104', name: 'ภาษาโปรแกรมคอมพิวเตอร์', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS3105', name: 'ระบบปฏิบัติการ', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS3109', name: 'ปัญญาประดิษฐ์', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS1103', name: 'อัลกอริทึมและแนวคิดการเขียนโปรแกรม', credit: 3, cat: 'major' },
  { code: 'COS2101', name: 'การเขียนโปรแกรมเชิงกระบวนคำสั่ง', credit: 3, cat: 'major' },
  { code: 'COS2102', name: 'การเขียนโปรแกรมเชิงอ็อบเจกต์', credit: 3, cat: 'major' },
  { code: 'COS2204', name: 'การเขียนโปรแกรมบนเว็บ', credit: 3, cat: 'major' },
  { code: 'COS4101', name: 'วิศวกรรมซอฟต์แวร์', credit: 3, cat: 'major' },
  { code: 'COS4311', name: 'รูปแบบการออกแบบซอฟต์แวร์', credit: 3, cat: 'major' },
  { code: 'COS2107', name: 'ปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์', credit: 3, cat: 'major' },
  { code: 'COS3401', name: 'การประมวลผลภาพดิจิทัล', credit: 3, cat: 'major' },
  { code: 'COS4104', name: 'สัมมนา', credit: 1, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS4105', name: 'โครงงานพิเศษ', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS2108', name: 'โครงสร้างและสภาปัตยกรรมคอมพิวเตอร์', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS3106', name: 'เครือข่ายคอมพิวเตอร์', credit: 3, cat: 'major' },
  { code: 'COS3103', name: 'ระบบฐานข้อมูล', credit: 3, cat: 'major', grade: 'C+' },
  { code: 'COS3107', name: 'การจัดการสารสนเทศ', credit: 3, cat: 'major', grade: 'F', reexam: true },
  { code: 'COS3108', name: 'การวิเคราะห์และออกแบบระบบ', credit: 3, cat: 'major', grade: 'C' },
  { code: 'COS3110', name: 'ฝึกงาน', credit: 0, cat: 'major' },
  { code: 'COS3302', name: 'การบูรณาการศาสตร์ทางข้อมูล', credit: 3, cat: 'major' },
  { code: 'COS4106', name: 'จรรยาบรรณทางวิชาชีพและเชิงสังคม', credit: 3, cat: 'major' },
  { code: 'COS2208', name: 'การเขียนโปรแกรม Java', credit: 3, cat: 'major' },
  { code: 'COS2209', name: 'การเขียนโปรแกรม C#', credit: 3, cat: 'major' }
];

async function run() {
  console.log('Finalizing Course Data Sync...');

  // 1. Master Courses
  const { error: e1 } = await supabase.from('courses').upsert(
    allCourses.map(c => ({ code: c.code, name: c.name, credit: c.credit, day: '', time: '', room: '', examDate: '', examTime: '' })),
    { onConflict: 'code' }
  );

  // 2. Degree Categories (Ensure they exist for both global and user)
  const cats = [
    { id: 'general', name: 'หมวดวิชาศึกษาทั่วไป', required: 30 },
    { id: 'core', name: 'หมวดวิชาแกน', required: 20 },
    { id: 'major', name: 'หมวดวิชาเอก', required: 40 },
    { id: 'elective', name: 'หมวดวิชาเลือกเสรี', required: 6 }
  ];
  
  for (const c of cats) {
    await supabase.from('degree_categories').upsert({ user_id: 'global', ...c }, { onConflict: 'user_id, id' });
    await supabase.from('degree_categories').upsert({ user_id: userId, ...c }, { onConflict: 'user_id, id' });
  }

  // 3. Degree Courses (Link courses to categories for BOTH)
  const degCourses = allCourses.map(c => ({ category_id: c.cat, course_code: c.code }));
  await supabase.from('degree_courses').upsert(degCourses.map(d => ({ user_id: 'global', ...d })), { onConflict: 'user_id, category_id, course_code' });
  await supabase.from('degree_courses').upsert(degCourses.map(d => ({ user_id: userId, ...d })), { onConflict: 'user_id, category_id, course_code' });

  // 4. Completed Courses (For user specifically)
  const completed = allCourses.filter(c => c.grade).map(c => ({
    user_id: userId,
    course_code: c.code,
    grade: c.grade,
    is_reexam: c.reexam || false
  }));
  await supabase.from('completed_courses').upsert(completed, { onConflict: 'user_id, course_code' });

  console.log('Success! All data synced.');
}

run();
