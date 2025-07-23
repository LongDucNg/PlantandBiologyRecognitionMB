import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export async function saveToHistory({ image, common, scientific }) {
  try {
    const json = await AsyncStorage.getItem('history');
    const current = json ? JSON.parse(json) : [];

    const newItem = {
      id: uuidv4(),
      image,
      common,
      scientific,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    await AsyncStorage.setItem('history', JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi khi lưu lịch sử:', err);
  }
}
