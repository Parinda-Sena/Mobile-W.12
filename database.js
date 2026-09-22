import * as Crypto from 'expo-crypto';

export const DATABASE_NAME = 'register_db.db';

export async function initDb(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      student_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

async function hashPassword(password, salt) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
}

export async function findDuplicate(db, student_id, username) {
  const row = await db.getFirstAsync(
    'SELECT student_id, username FROM students WHERE student_id = ? OR username = ?',
    [student_id, username]
  );

  if (!row) return null;
  if (row.student_id === student_id) return 'student_id';
  return 'username';
}

export async function registerStudent(db, name, surname, student_id, username, password) {
  const duplicate = await findDuplicate(db, student_id, username);

  if (duplicate === 'student_id') {
    return { ok: false, field: 'student_id', message: 'รหัสนี้ลงทะเบียนไปแล้ว' };
  }

  if (duplicate === 'username') {
    return { ok: false, field: 'username', message: 'ชื่อผู้ใช้นี้ลงทะเบียนไปแล้ว' };
  }

  const salt = Crypto.randomUUID();
  const hash = await hashPassword(password, salt);

  try {
    const result = await db.runAsync(
      `INSERT INTO students (name, surname, student_id, username, password_salt, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, student_id, username, salt, hash, new Date().toISOString()]
    );

    return { ok: true, id: result.lastInsertRowId };
  } catch (e) {
    console.warn('registerStudent ล้มเหลว', e);
    return { ok: false, field: null, message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' };
  }
}

export async function listAllAsync(db) {
  return await db.getAllAsync(
    `SELECT id, name, surname, student_id, username, substr(password_hash, 1, 16) AS hash_preview 
     FROM students ORDER BY id DESC`
  );
}

export async function countStudents(db) {
  const result = await db.getFirstAsync('SELECT COUNT(*) AS n FROM students');
  return result?.n ?? 0;
}

export async function clearStudents(db) {
  const result = await db.runAsync('DELETE FROM students');
  return result?.changes ?? 0;
}