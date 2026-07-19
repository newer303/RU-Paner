import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('Starting migration to multi-user schema...');

try {
  db.transaction(() => {
    // 1. Migrate settings
    console.log('Migrating settings...');
    db.exec('ALTER TABLE settings RENAME TO settings_old');
    db.exec(`
      CREATE TABLE settings (
        user_id TEXT DEFAULT 'global',
        key TEXT, 
        value TEXT,
        PRIMARY KEY(user_id, key)
      )
    `);
    db.exec("INSERT INTO settings (user_id, key, value) SELECT 'global', key, value FROM settings_old");
    db.exec('DROP TABLE settings_old');

    // 2. Migrate events
    console.log('Migrating events...');
    db.exec('ALTER TABLE events RENAME TO events_old');
    db.exec(`
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'global',
        title TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        type TEXT NOT NULL,
        region TEXT NOT NULL,
        dateStr TEXT NOT NULL,
        sendNotify BOOLEAN DEFAULT 0
      )
    `);
    db.exec("INSERT INTO events (id, user_id, title, startDate, endDate, type, region, dateStr) SELECT id, 'global', title, startDate, endDate, type, region, dateStr FROM events_old");
    db.exec('DROP TABLE events_old');

    // 3. Migrate degree_categories
    console.log('Migrating degree_categories...');
    db.exec('ALTER TABLE degree_categories RENAME TO degree_categories_old');
    db.exec(`
      CREATE TABLE degree_categories (
        id TEXT PRIMARY KEY, 
        user_id TEXT DEFAULT 'global',
        name TEXT NOT NULL, 
        required INTEGER NOT NULL
      )
    `);
    db.exec("INSERT INTO degree_categories (id, user_id, name, required) SELECT id, 'global', name, required FROM degree_categories_old");
    db.exec('DROP TABLE degree_categories_old');

    // 4. Migrate degree_courses
    console.log('Migrating degree_courses...');
    db.exec('ALTER TABLE degree_courses RENAME TO degree_courses_old');
    db.exec(`
      CREATE TABLE degree_courses (
        user_id TEXT DEFAULT 'global',
        category_id TEXT, 
        course_code TEXT, 
        PRIMARY KEY(user_id, category_id, course_code)
      )
    `);
    db.exec("INSERT INTO degree_courses (user_id, category_id, course_code) SELECT 'global', category_id, course_code FROM degree_courses_old");
    db.exec('DROP TABLE degree_courses_old');

    // 5. Migrate completed_courses
    console.log('Migrating completed_courses...');
    db.exec('ALTER TABLE completed_courses RENAME TO completed_courses_old');
    db.exec(`
      CREATE TABLE completed_courses (
        user_id TEXT DEFAULT 'global',
        course_code TEXT, 
        grade TEXT,
        PRIMARY KEY(user_id, course_code)
      )
    `);
    db.exec("INSERT INTO completed_courses (user_id, course_code, grade) SELECT 'global', course_code, grade FROM completed_courses_old");
    db.exec('DROP TABLE completed_courses_old');

    // 6. Migrate planner_courses
    console.log('Migrating planner_courses...');
    db.exec('ALTER TABLE planner_courses RENAME TO planner_courses_old');
    db.exec(`
      CREATE TABLE planner_courses (
        user_id TEXT DEFAULT 'global',
        course_code TEXT,
        PRIMARY KEY(user_id, course_code)
      )
    `);
    db.exec("INSERT INTO planner_courses (user_id, course_code) SELECT 'global', course_code FROM planner_courses_old");
    db.exec('DROP TABLE planner_courses_old');

  })();
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}
