import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import Field from '../components/Field';
import { styles } from '../styles/registerStyles';
import { validateForm, hasError } from '../utils/validate';
import { registerStudent } from '../db/database';

const EMPTY_FORM = {
  name: '',
  surname: '',
  student_id: '',
  username: '',
  password: '',
  confirm: '',
};

const RegisterScreen = ({ onRegistered }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const handleSubmit = async () => {
    setSuccess('');
    const found = validateForm(form);
    if (hasError(found)) {
      setErrors(found);
      return;
    }

    console.log('ข้อมูลถูกต้อง พร้อมบันทึก', form);
    setSaving(true);

    try {
      // ส่งพารามิเตอร์เรียงตามลำดับที่ database.js ต้องการ
      const result = await registerStudent(
        db,
        form.name?.trim() ?? '',
        form.surname?.trim() ?? '',
        form.student_id?.trim() ?? '',
        form.username?.trim() ?? '',
        form.password ?? ''
      );

      setSaving(false);

      if (!result.ok) {
        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          Alert.alert('ผิดพลาด', result.message);
        }
        return;
      }

      setForm(EMPTY_FORM);
      setErrors({});
      setSuccess(`ลงทะเบียนสำเร็จ หมายเลขในระบบคือ ${result.id}`);
      onRegistered?.();
    } catch (e) {
      setSaving(false);
      console.warn('บันทึกข้อมูลล้มเหลว', e);
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>กรอกข้อมูลให้ครบทุกช่อง</Text>

        {Boolean(success) && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{success}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Field
            style={styles.half}
            label="ชื่อ"
            placeholder="somchai"
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            error={errors.name}
          />

          <Field
            style={styles.half}
            label="นามสกุล"
            placeholder="jaidee"
            value={form.surname}
            onChangeText={(v) => setField('surname', v)}
            error={errors.surname}
          />
        </View>

        <Field
          label="รหัสนิสิต"
          placeholder="6721601338"
          value={form.student_id}
          onChangeText={(v) => setField('student_id', v)}
          error={errors.student_id}
          maxLength={10}
          keyboardType="number-pad"
        />

        <Field
          label="ชื่อผู้ใช้"
          placeholder="Somchai.j"
          value={form.username}
          onChangeText={(v) => setField('username', v)}
          error={errors.username}
          hint="ใช้สำหรับเข้าสู่ระบบ ห้ามซ้ำกับผู้อื่น"
          autoCapitalize="none"
          maxLength={20}
        />

        <Field
          label="รหัสผ่าน"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          secureTextEntry
          autoCapitalize="none"
          value={form.password}
          onChangeText={(v) => setField('password', v)}
          error={errors.password}
          hint="อย่างน้อย 8 ตัวอักษร ต้องมีทั้งตัวเลขและตัวอักษร"
        />

        <Field
          label="ยืนยันรหัสผ่าน"
          placeholder="พิมพ์รหัสผ่านอีกครั้ง"
          secureTextEntry
          autoCapitalize="none"
          value={form.confirm}
          onChangeText={(v) => setField('confirm', v)}
          error={errors.confirm}
          hint="อย่างน้อย 8 ตัวอักษร ต้องมีทั้งตัวเลขและตัวอักษร"
        />

        <Pressable
          style={[styles.submit, saving ? styles.submitDisabled : null]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitText}>
            {saving ? 'กำลังบันทึก...' : 'ลงทะเบียน'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;