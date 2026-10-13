export function validateForm({ name, surname, student_id, username, password, confirm } = {}) {
  const errors = {};

  const cleanName = name?.trim() ?? '';
  const cleanSurname = surname?.trim() ?? '';
  const cleanStudentId = student_id?.trim() ?? '';
  const cleanUsername = username?.trim() ?? '';
  const cleanPassword = password ?? '';
  const cleanConfirm = confirm ?? '';

  // ตรวจสอบชื่อ-นามสกุล
  if (cleanName === '') errors.name = 'กรุณากรอกชื่อ';
  if (cleanSurname === '') errors.surname = 'กรุณากรอกนามสกุล';

  // ตรวจสอบรหัสนิสิต (ตัวเลข 10 หลัก)
  if (!/^\d{10}$/.test(cleanStudentId)) {
    errors.student_id = 'รหัสนิสิตต้องเป็นตัวเลข 10 หลัก';
  }

  // ตรวจสอบชื่อผู้ใช้ (a-z, A-Z, 0-9, _ ความยาว 4-20 ตัว)
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(cleanUsername)) {
    errors.username = 'ชื่อผู้ใช้ยาว 4-20 ตัว ใช้ได้เฉพาะ a-z A-Z 0-9 และ _';
  }

  // ตรวจสอบรหัสผ่าน
  if (cleanPassword.length < 8) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
  } else if (!/[a-zA-Z]/.test(cleanPassword) || !/\d/.test(cleanPassword)) {
    errors.password = 'รหัสผ่านต้องมีทั้งตัวเลขและตัวอักษร';
  }

  // ตรวจสอบการยืนยันรหัสผ่าน
  if (cleanConfirm === '') {
    errors.confirm = 'กรุณากรอกยืนยันรหัสผ่าน';
  } else if (cleanPassword !== cleanConfirm) {
    errors.confirm = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
  }

  return errors;
}

export function hasError(errors) {
  return Object.keys(errors).length > 0;
}