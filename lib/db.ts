import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'database.sqlite');

declare global {
  // eslint-disable-next-line no-var
  var db: Database.Database | undefined;
}

const db = global.db || new Database(dbPath);

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

// Enable foreign keys and WAL mode
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// 1. Ensure core tables exist
// Create all required tables in one pass
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT DEFAULT 'global',
    key TEXT,
    value TEXT,
    PRIMARY KEY(user_id, key),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS degree_categories (
    user_id TEXT DEFAULT 'global',
    id TEXT,
    name TEXT,
    required INTEGER,
    PRIMARY KEY(user_id, id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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

  CREATE TABLE IF NOT EXISTS degree_courses (
    user_id TEXT DEFAULT 'global',
    category_id TEXT,
    course_code TEXT,
    PRIMARY KEY(user_id, category_id, course_code),
    FOREIGN KEY(user_id, category_id) REFERENCES degree_categories(user_id, id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS completed_courses (
    user_id TEXT DEFAULT 'global',
    course_code TEXT,
    grade TEXT,
    PRIMARY KEY(user_id, course_code),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS planner_courses (
    user_id TEXT DEFAULT 'global',
    course_code TEXT,
    PRIMARY KEY(user_id, course_code),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

db.exec(createTablesSQL);

// 2. Schema Validation: Add missing course columns if needed
const courseColumns = db.prepare('PRAGMA table_info(courses)').all() as any[];
const courseColumnNames = courseColumns.map(col => col.name);
const missingCourseColumns: Array<{ name: string; definition: string }> = [];
if (!courseColumnNames.includes('lecDay')) missingCourseColumns.push({ name: 'lecDay', definition: 'TEXT' });
if (!courseColumnNames.includes('lecTime')) missingCourseColumns.push({ name: 'lecTime', definition: 'TEXT' });
if (!courseColumnNames.includes('lecRoom')) missingCourseColumns.push({ name: 'lecRoom', definition: 'TEXT' });
if (!courseColumnNames.includes('labDay')) missingCourseColumns.push({ name: 'labDay', definition: 'TEXT' });
if (!courseColumnNames.includes('labTime')) missingCourseColumns.push({ name: 'labTime', definition: 'TEXT' });
if (!courseColumnNames.includes('labRoom')) missingCourseColumns.push({ name: 'labRoom', definition: 'TEXT' });
if (!courseColumnNames.includes('isFacultyExam')) missingCourseColumns.push({ name: 'isFacultyExam', definition: 'INTEGER DEFAULT 0' });
if (!courseColumnNames.includes('examMonthOnly')) missingCourseColumns.push({ name: 'examMonthOnly', definition: 'INTEGER DEFAULT 0' });
if (!courseColumnNames.includes('examMonth')) missingCourseColumns.push({ name: 'examMonth', definition: 'TEXT' });

if (missingCourseColumns.length > 0) {
  missingCourseColumns.forEach(col => {
    console.log(`Adding missing courses column: ${col.name}`);
    db.exec(`ALTER TABLE courses ADD COLUMN ${col.name} ${col.definition}`);
  });
}

// 3. Schema Fixes: Fix degree_categories PK if needed
const degreeCategoryInfo = db.prepare("PRAGMA table_info(degree_categories)").all() as any[];
const degreePkCount = degreeCategoryInfo.filter(c => c.pk > 0).length;
const degreeIdIsPkOnly = degreeCategoryInfo.find(c => c.name === 'id' && c.pk === 1) && degreePkCount === 1;

if (degreeIdIsPkOnly) {
  console.log('Detected incorrect primary key on degree_categories. Fixing...');
  db.transaction(() => {
    db.exec('PRAGMA foreign_keys=OFF');
    db.exec('ALTER TABLE degree_categories RENAME TO degree_categories_old');
    db.exec(`
      CREATE TABLE degree_categories (
        user_id TEXT DEFAULT 'global',
        id TEXT,
        name TEXT,
        required INTEGER,
        PRIMARY KEY(user_id, id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.exec('INSERT INTO degree_categories (user_id, id, name, required) SELECT user_id, id, name, required FROM degree_categories_old');
    db.exec('DROP TABLE degree_categories_old');
    db.exec('PRAGMA foreign_keys=ON');
  })();
  console.log('Fixed degree_categories schema.');
}

export default db;
