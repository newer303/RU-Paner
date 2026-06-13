import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courses = [
  { code: 'RAM1142', name: 'การพัฒนาคุณภาพชีวิตและสังคม', credit: 3 },
  { code: 'RAM1111', name: 'ภาษาอังกฤษในชีวิตประจำวัน', credit: 3 },
  { code: 'RAM1132', name: 'ทักษะความเข้าใจและการใช้เทคโนโลยีดิจิทัล', credit: 3 },
  { code: 'RAM1101', name: 'ทักษะการใช้ภาษาไทย', credit: 3 },
  { code: 'RAM1114', name: 'ภาษาและวัฒนธรรมญี่ปุ่น', credit: 3 },
  { code: 'RAM1203', name: 'ศาสตร์การคิดเปลี่ยนโลก', credit: 3 },
  { code: 'RAM1212', name: 'ผู้ประกอบการรุ่นใหม่', credit: 3 },
  { code: 'RAM1301', name: 'คุณธรรมคู่ความรู้', credit: 3 },
  { code: 'RAM1302', name: 'การเมืองและกฎหมายในชีวิตประจำวัน', credit: 3 },
  { code: 'RAM1312', name: 'วัฒนธรรมร่วมสมัยกับการเปลี่ยนฉับพลันทางดิจิทัล', credit: 3 },
  { code: 'RAM1131', name: 'ทักษะการเข้าใจดิจิทัล', credit: 3 },
  { code: 'COS4602', name: 'ความมั่นคงของเครือข่าย', credit: 3 },
  { code: 'MTH1101', name: 'แคลคูลัสและเลขาคณิตวิเคาะห์ 1', credit: 3 },
  { code: 'MTH1201', name: 'คณิตศาสตร์สำหรับวิทการคอมพิวเตอร์', credit: 3 },
  { code: 'STA2003', name: 'หลักสถิติ', credit: 3 },
  { code: 'COS1102', name: 'โครงสร้างไม่ต่อเนื่อง', credit: 3 },
  { code: 'COS3101', name: 'วิธีเชิงตัวเลข', credit: 3 },
  { code: 'COS1101', name: 'วิทยาการคอมพิวเตอร์เบื้องต้น', credit: 3 },
  { code: 'COS2103', name: 'โครงสร้างข้อมูลและอัลกอริทึม', credit: 3 },
  { code: 'COS2105', name: 'ทฤษฎีการคำนวณ', credit: 3 },
  { code: 'COS3104', name: 'ภาษาโปรแกรมคอมพิวเตอร์', credit: 3 },
  { code: 'COS3105', name: 'ระบบปฏิบัติการ', credit: 3 },
  { code: 'COS3109', name: 'ปัญญาประดิษฐ์', credit: 3 },
  { code: 'COS1103', name: 'อัลกอริทึมและแนวคิดการเขียนโปรแกรม', credit: 3 },
  { code: 'COS2101', name: 'การเขียนโปรแกรมเชิงกระบวนคำสั่ง', credit: 3 },
  { code: 'COS2102', name: 'การเขียนโปรแกรมเชิงอ็อบเจกต์', credit: 3 },
  { code: 'COS2204', name: 'การเขียนโปรแกรมบนเว็บ', credit: 3 },
  { code: 'COS4101', name: 'วิศวกรรมซอฟต์แวร์', credit: 3 },
  { code: 'COS4311', name: 'รูปแบบการออกแบบซอฟต์แวร์', credit: 3 },
  { code: 'COS2107', name: 'ปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์', credit: 3 },
  { code: 'COS3401', name: 'การประมวลผลภาพดิจิตัล', credit: 3 },
  { code: 'COS4104', name: 'สัมมนา', credit: 1 },
  { code: 'COS4105', name: 'โครงงานพิเศษ', credit: 3 },
  { code: 'COS2108', name: 'โครงสร้างและสภาปัตยกรรมคอมพิวเตอร์', credit: 3 },
  { code: 'COS3106', name: 'เครือข่ายคอมพิวเตอร์', credit: 3 },
  { code: 'COS3103', name: 'ระบบฐานข้อมูล', credit: 3 },
  { code: 'COS3107', name: 'การจัดการสารสนเทศ', credit: 3 },
  { code: 'COS3108', name: 'การวิเคาะห์และออกเเบบระบบ', credit: 3 },
  { code: 'COS3110', name: 'ฝึกงาน', credit: 0 },
  { code: 'COS3302', name: 'การบูรณาการศาสตร์ทางข้อมูล', credit: 3 },
  { code: 'COS4106', name: 'จรรยาบรรณทางวิชาชีพและเชิงสังคม', credit: 3 },
  { code: 'COS2208', name: 'การเขียนโปรแกรม JAVA', credit: 3 },
  { code: 'COS2209', name: 'การเขียนโปรแกรม C#', credit: 3 }
];

const completed = [
  { code: 'RAM1142', grade: 'B', is_reexam: false },
  { code: 'RAM1111', grade: 'B+', is_reexam: false },
  { code: 'RAM1132', grade: 'B+', is_reexam: false },
  { code: 'RAM1101', grade: 'B', is_reexam: false },
  { code: 'RAM1114', grade: 'F', is_reexam: true },
  { code: 'RAM1203', grade: 'D', is_reexam: false },
  { code: 'RAM1212', grade: 'D', is_reexam: false },
  { code: 'RAM1301', grade: 'A', is_reexam: false },
  { code: 'RAM1302', grade: 'C+', is_reexam: false },
  { code: 'RAM1312', grade: 'C+', is_reexam: false },
  { code: 'RAM1131', grade: 'D+', is_reexam: false },
  { code: 'COS4602', grade: 'B', is_reexam: false },
  { code: 'MTH1101', grade: 'B', is_reexam: false },
  { code: 'MTH1201', grade: 'F', is_reexam: true },
  { code: 'STA2003', grade: 'B', is_reexam: false },
  { code: 'COS1102', grade: 'C+', is_reexam: false },
  { code: 'COS3101', grade: 'A', is_reexam: false },
  { code: 'COS2103', grade: 'C+', is_reexam: false },
  { code: 'COS2105', grade: 'F', is_reexam: true },
  { code: 'COS3104', grade: 'F', is_reexam: true },
  { code: 'COS3105', grade: 'F', is_reexam: true },
  { code: 'COS3109', grade: 'F', is_reexam: true },
  { code: 'COS4104', grade: 'F', is_reexam: true },
  { code: 'COS4105', grade: 'F', is_reexam: true },
  { code: 'COS2108', grade: 'F', is_reexam: true },
  { code: 'COS3103', grade: 'C+', is_reexam: false },
  { code: 'COS3107', grade: 'F', is_reexam: true },
  { code: 'COS3108', grade: 'C', is_reexam: false }
];

async function importData() {
  console.log('Starting data import to Supabase...');

  // 1. Upsert Courses
  console.log('Upserting courses...');
  const { error: courseError } = await supabase.from('courses').upsert(
    courses.map(c => ({
      code: c.code,
      name: c.name,
      credit: c.credit,
      day: '',
      time: '',
      room: '',
      examDate: '',
      examTime: ''
    })),
    { onConflict: 'code' }
  );
  if (courseError) {
    console.error('Error upserting courses:', courseError);
    return;
  }

  // 2. Map to Categories
  console.log('Mapping courses to categories...');
  const degreeCourses = courses.map(c => {
    let catId = 'major';
    if (c.code.startsWith('RAM')) catId = 'general';
    else if (
      c.code.startsWith('MTH') || 
      c.code.startsWith('STA') || 
      ['COS1101', 'COS1102', 'COS3101', 'COS2103'].includes(c.code)
    ) catId = 'core';

    return {
      user_id: 'global',
      category_id: catId,
      course_code: c.code
    };
  });

  const { error: degreeCourseError } = await supabase.from('degree_courses').upsert(
    degreeCourses,
    { onConflict: 'user_id, category_id, course_code' }
  );
  if (degreeCourseError) {
    console.error('Error upserting degree courses:', degreeCourseError);
    return;
  }

  // 3. Import Completed
  console.log('Upserting completed courses...');
  const { error: completedError } = await supabase.from('completed_courses').upsert(
    completed.map(c => ({
      user_id: 'global',
      course_code: c.code,
      grade: c.grade,
      is_reexam: c.is_reexam
    })),
    { onConflict: 'user_id, course_code' }
  );
  if (completedError) {
    console.error('Error upserting completed courses:', completedError);
    return;
  }

  console.log('Data import completed successfully!');
}

importData();
