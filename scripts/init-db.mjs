import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'global',
    title TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    type TEXT NOT NULL,
    region TEXT NOT NULL,
    dateStr TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS courses (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    credit INTEGER NOT NULL,
    day TEXT,
    time TEXT,
    room TEXT,
    lecDay TEXT,
    lecTime TEXT,
    lecRoom TEXT,
    labDay TEXT,
    labTime TEXT,
    labRoom TEXT,
    examDate TEXT,
    examTime TEXT,
    isFacultyExam INTEGER DEFAULT 0,
    examMonthOnly INTEGER DEFAULT 0,
    examMonth TEXT
  );

  CREATE TABLE IF NOT EXISTS degree_categories (
    user_id TEXT DEFAULT 'global',
    id TEXT,
    name TEXT NOT NULL,
    required INTEGER NOT NULL,
    PRIMARY KEY (user_id, id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS degree_courses (
    user_id TEXT DEFAULT 'global',
    category_id TEXT,
    course_code TEXT,
    PRIMARY KEY (user_id, category_id, course_code),
    FOREIGN KEY (user_id, category_id) REFERENCES degree_categories(user_id, id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT DEFAULT 'global',
    key TEXT,
    value TEXT,
    PRIMARY KEY (user_id, key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS completed_courses (
    user_id TEXT DEFAULT 'global',
    course_code TEXT,
    grade TEXT,
    PRIMARY KEY (user_id, course_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS planner_courses (
    user_id TEXT DEFAULT 'global',
    course_code TEXT,
    PRIMARY KEY (user_id, course_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Migration: Add grade column if it doesn't exist
try {
  db.exec('ALTER TABLE completed_courses ADD COLUMN grade TEXT');
} catch {
  // Column already exists
}

// Mock Data from app/page.tsx
const MOCK_CALENDAR = [
  { title: 'ประกาศผลสอบ ภาค 2/2568', startDate: '2026-05-15', endDate: '2026-05-15', type: 'other', region: 'all', dateStr: '15 พ.ค. 2026' },
  { title: 'ลงทะเบียนเรียน ภาค 1/2569 (นักศึกษาเก่า)', startDate: '2026-05-20', endDate: '2026-05-28', type: 'registration', region: 'all', dateStr: '20-28 พ.ค. 2026' },
  { title: 'เริ่มบรรยาย ภาค 1/2569', startDate: '2026-06-01', endDate: '2026-06-01', type: 'lecture', region: 'all', dateStr: '1 มิ.ย. 2026' },
  { title: 'สอบ e-testing', startDate: '2026-09-15', endDate: '2026-09-15', type: 'exam', region: 'central', dateStr: '15 ก.ย. 2026' },
  { title: 'สอบไล่ ภาค 1/2569 (วันแรก)', startDate: '2026-10-15', endDate: '2026-10-15', type: 'exam', region: 'all', dateStr: '15 ต.ค. 2026' },
  { title: 'สอบไล่ ภาค 1/2569 (วันสุดท้าย)', startDate: '2026-10-25', endDate: '2026-10-25', type: 'exam', region: 'all', dateStr: '25 ต.ค. 2026' },
  { title: 'สอบซ่อม ภาค 2/2568', startDate: '2026-11-01', endDate: '2026-11-02', type: 'exam', region: 'regional', dateStr: '1-2 พ.ย. 2026' },
];

const MOCK_COURSES = [
  { code: 'RAM1000', name: 'ความรู้คู่คุณธรรม', credit: 3, day: 'จันทร์', time: '09:30 - 11:20', room: 'KTB 201', examDate: '2026-10-15', examTime: 'เช้า (09:30-12:00)' },
  { code: 'RAM1111', name: 'ภาษาอังกฤษเพื่อการสื่อสาร', credit: 3, day: 'อังคาร', time: '09:30 - 11:20', room: 'KTB 301', examDate: '2026-10-16', examTime: 'เช้า (09:30-12:00)' },
  { code: 'POL1101', name: 'การเมืองและการปกครองไทย', credit: 3, day: 'อังคาร', time: '13:30 - 15:20', room: 'VPB 301', examDate: '2026-10-16', examTime: 'บ่าย (14:00-16:30)' },
  { code: 'POL1102', name: 'ความเบื้องต้นเกี่ยวกับรัฐศาสตร์', credit: 3, day: 'พุธ', time: '13:30 - 15:20', room: 'VPB 401', examDate: '2026-10-17', examTime: 'บ่าย (14:00-16:30)' },
  { code: 'ENG1001', name: 'ประโยคพื้นฐานและศัพท์จำเป็น', credit: 3, day: 'พุธ', time: '09:30 - 11:20', room: 'KLB 401', examDate: '2026-10-15', examTime: 'เช้า (09:30-12:00)' },
  { code: 'ENG1002', name: 'ประโยคและศัพท์ทั่วไป', credit: 3, day: 'พฤหัส', time: '09:30 - 11:20', room: 'KLB 401', examDate: '2026-10-17', examTime: 'เช้า (09:30-12:00)' },
  { code: 'LAW1101', name: 'หลักกฎหมายมหาชน', credit: 3, day: 'ศุกร์', time: '11:30 - 13:20', room: 'LOB 1001', examDate: '2026-10-18', examTime: 'บ่าย (14:00-16:30)' },
  { code: 'LAW1102', name: 'หลักกฎหมายเอกชน', credit: 3, day: 'ศุกร์', time: '13:30 - 15:20', room: 'LOB 1002', examDate: '2026-10-19', examTime: 'บ่าย (14:00-16:30)' },
  { code: 'MGT1001', name: 'ความรู้เบื้องต้นเกี่ยวกับการบริหารธุรกิจ', credit: 3, day: 'จันทร์', time: '13:30 - 15:20', room: 'SKB 501', examDate: '2026-10-19', examTime: 'เช้า (09:30-12:00)' },
];

const MOCK_DEGREE_PLAN = {
  major: 'รัฐศาสตร์ แผน A',
  totalCredits: 129,
  categories: [
    {
      id: 'general',
      name: 'หมวดวิชาศึกษาทั่วไป',
      required: 33,
      courses: ['RAM1000', 'RAM1111', 'ENG1001', 'ENG1002']
    },
    {
      id: 'core',
      name: 'หมวดวิชาแกน',
      required: 18,
      courses: ['POL1101', 'POL1102', 'LAW1101', 'LAW1102']
    },
    {
      id: 'major',
      name: 'หมวดวิชาเอกบังคับ',
      required: 39,
      courses: ['POL2101', 'POL2102', 'POL2103', 'POL2104']
    }
  ]
};

const COMPLETED_COURSES = ['RAM1000', 'POL1101'];

// Insert Calendar Events
const insertEvent = db.prepare('INSERT OR IGNORE INTO events (user_id, title, startDate, endDate, type, region, dateStr) VALUES (?, ?, ?, ?, ?, ?, ?)');
for (const event of MOCK_CALENDAR) {
  insertEvent.run('global', event.title, event.startDate, event.endDate, event.type, event.region, event.dateStr);
}

// Insert Courses
const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (code, name, credit, day, time, room, examDate, examTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
for (const course of MOCK_COURSES) {
  insertCourse.run(course.code, course.name, course.credit, course.day, course.time, course.room, course.examDate, course.examTime);
}

// Ensure courses from degree plan exist
for (const cat of MOCK_DEGREE_PLAN.categories) {
  for (const courseCode of cat.courses) {
    insertCourse.run(courseCode, 'ไม่ระบุชื่อวิชา', 3, null, null, null, null, null);
  }
}

// Insert Degree Plan Categories
const insertCategory = db.prepare('INSERT OR IGNORE INTO degree_categories (user_id, id, name, required) VALUES (?, ?, ?, ?)');
const insertDegreeCourse = db.prepare('INSERT OR IGNORE INTO degree_courses (user_id, category_id, course_code) VALUES (?, ?, ?)');
for (const cat of MOCK_DEGREE_PLAN.categories) {
  insertCategory.run('global', cat.id, cat.name, cat.required);
  for (const courseCode of cat.courses) {
    insertDegreeCourse.run('global', cat.id, courseCode);
  }
}

// Insert Settings
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (user_id, key, value) VALUES (?, ?, ?)');
insertSetting.run('global', 'major', MOCK_DEGREE_PLAN.major);
insertSetting.run('global', 'totalCredits', MOCK_DEGREE_PLAN.totalCredits.toString());

// Insert Completed Courses
const insertCompleted = db.prepare('INSERT OR IGNORE INTO completed_courses (user_id, course_code) VALUES (?, ?)');
for (const courseCode of COMPLETED_COURSES) {
  insertCompleted.run('global', courseCode);
}

console.log('Database initialized successfully with mock data.');
db.close();
