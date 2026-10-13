import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { styles } from "../styles/studentListStyles";
import { listAllAsync, clearStudents } from "../db/database";

export default function StudentListScreen({ reloadKey }) {
  const db = useSQLiteContext();
  const [rows, setRows] = useState([]);

  const reload = useCallback(async () => {
    try {
      const data = await listAllAsync(db);
      setRows(data);
    } catch (e) {
      console.warn("โหลดข้อมูลล้มเหลว", e);
    }
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload, reloadKey]);

  function handleClear() {
    Alert.alert('ล้างข้อมูลทั้งหมด', 'ลบข้อมูลผู้ลงทะเบียนทุกคน กู้คืนไม่ได้', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ล้าง',
        style: 'destructive',
        onPress: async () => {
          const result = await clearStudents(db);
          await reload();
          Alert.alert('สำเร็จ', `ลบข้อมูลเรียบร้อยแล้ว (${result} รายการ)`);
        }
      }
    ]);
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <Text style={styles.summary}> ลงทะเบียนแล้ว {rows.length} คน </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardLine}> ชื่อ-นามสกุล {item.name} {item.surname}</Text>
          <Text style={styles.cardLine}> รหัสนิสิต {item.student_id}</Text>
          <Text style={styles.cardLine}> ชื่อผู้ใช้ {item.username}</Text>
          <Text style={styles.hashLabel}> คำย่อยรหัสผ่าน {' '}
            <Text style={styles.hashValue}>{item.hash_preview}...</Text>
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}> ยังไม่มีผู้ลงทะเบียน </Text>
      }
      ListFooterComponent={
        rows.length > 0 ? (
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}> ล้างข้อมูลทั้งหมด </Text>
          </Pressable>
        ) : null
      }
    />
  );
}