import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const targetEmail = 'nkegamer1@gmail.com';
const courses = [
  { code: 'RAM1142', name: 'การพัฒนาคุณภาพชีวิตและสังคม' },
  { code: 'RAM1111', name: 'ภาษาอังกฤษในชีวิตประจำวัน' },
  { code: 'RAM1132', name: 'ทักษะความเข้าใจและการใช้เทคโนโลยีดิจิทัล' },
  { code: 'RAM1101', name: 'ทักษะการใช้ภาษาไทย' },
  { code: 'RAM1114', name: 'ภาษาและวัฒนธรรมญี่ปุ่น' },
  { code: 'RAM1203', name: 'ศาสตร์การคิดเปลี่ยนโลก' },
  { code: 'RAM1212', name: 'ผู้ประกอบการรุ่นใหม่' },
  { code: 'RAM1301', name: 'คุณธรรมคู่ความรู้' },
  { code: 'RAM1302', name: 'การเมืองและกฎหมายในชีวิตประจำวัน' },
  { code: 'RAM1312', name: 'วัฒนธรรมร่วมสมัยกับการเปลี่ยนฉับพลันทางดิจิทัล' },
  { code: 'RAM1131', name: 'ทักษะการเข้าใจดิจิทัล' },
  { code: 'COS4602', name: 'ความมั่นคงของเครือข่าย' },
  { code: 'MTH1101', name: 'แคลคูลัสและเลขาคณิตวิเคราะห์ 1' },
  { code: 'MTH1201', name: 'คณิตศาสตร์สำหรับวิทยาการคอมพิวเตอร์' },
  { code: 'STA2003', name: 'หลักสถิติ' },
  { code: 'COS1102', name: 'โครงสร้างไม่ต่อเนื่อง' },
  { code: 'COS3101', name: 'วิธีเชิงตัวเลข' },
  { code: 'COS1101', name: 'วิทยาการคอมพิวเตอร์เบื้องต้น' },
  { code: 'COS2103', name: 'โครงสร้างข้อมูลและอัลกอริทึม' },
  { code: 'COS2105', name: 'ทฤษฎีการคำนวณ' },
  { code: 'COS3104', name: 'ภาษาโปรแกรมคอมพิวเตอร์' },
  { code: 'COS3105', name: 'ระบบปฏิบัติการ' },
  { code: 'COS3109', name: 'ปัญญาประดิษฐ์' },
  { code: 'COS1103', name: 'อัลกอริทึมและแนวคิดการเขียนโปรแกรม' },
  { code: 'COS2101', name: 'การเขียนโปรแกรมเชิงกระบวนคำสั่ง' },
  { code: 'COS2102', name: 'การเขียนโปรแกรมเชิงวัตถุ' },
  { code: 'COS2204', name: 'การเขียนโปรแกรมบนเว็บ' },
  { code: 'COS4101', name: 'วิศวกรรมซอฟต์แวร์' },
  { code: 'COS4311', name: 'รูปแบบการออกแบบซอฟต์แวร์' },
  { code: 'COS2107', name: 'ปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์' },
  { code: 'COS3401', name: 'การประมวลผลภาพดิจิทัล' },
  { code: 'COS4104', name: 'สัมมนา' },
  { code: 'COS4105', name: 'โครงงานพิเศษ' },
  { code: 'COS2108', name: 'โครงสร้างและสถาปัตยกรรมคอมพิวเตอร์' },
  { code: 'COS3106', name: 'เครือข่ายคอมพิวเตอร์' },
  { code: 'COS3103', name: 'ระบบฐานข้อมูล' },
  { code: 'COS3107', name: 'การจัดการสารสนเทศ' },
  { code: 'COS3108', name: 'การวิเคราะห์และออกแบบระบบ' },
  { code: 'COS3110', name: 'ฝึกงาน' },
  { code: 'COS3302', name: 'การบูรณาการศาสตร์ทางข้อมูล' },
  { code: 'COS4106', name: 'จรรยาบรรณทางวิชาชีพและเชิงสังคม' },
  { code: 'COS2208', name: 'การเขียนโปรแกรม Java' },
  { code: 'COS2209', name: 'การเขียนโปรแกรม C#' }
];

async function run() {
  console.log(`Starting import for ${targetEmail}...`);

  // 1. Find User ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', targetEmail)
    .single();

  if (userError || !user) {
    console.error(`User with email ${targetEmail} not found. Error:`, userError?.message);
    process.exit(1);
  }

  const userId = user.id;
  console.log(`Found User ID: ${userId}`);

  // 2. Prepare Master Courses Data
  const masterCourses = courses.map(c => ({
    code: c.code,
    name: c.name,
    credit: 3,
    day: '',
    time: '',
    room: '',
    examDate: '',
    examTime: ''
  }));

  // 3. Upsert Master Courses
  console.log('Updating master courses list...');
  const { error: masterError } = await supabase
    .from('courses')
    .upsert(masterCourses, { onConflict: 'code' });

  if (masterError) {
    console.error('Error upserting master courses:', masterError.message);
  } else {
    console.log('Master courses updated successfully.');
  }

  // 4. Add to User's Planner
  console.log(`Adding courses to planner for user ${userId}...`);
  const plannerEntries = courses.map(c => ({
    user_id: userId,
    course_code: c.code
  }));

  const { error: plannerError } = await supabase
    .from('planner_courses')
    .upsert(plannerEntries, { onConflict: 'user_id,course_code' });

  if (plannerError) {
    console.error('Error updating planner:', plannerError.message);
  } else {
    console.log(`Successfully added 43 courses to planner for ${targetEmail}`);
  }
}

run();
