// services/createSessionAPI.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createSession(userId, sessionId) {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) throw new Error('Không tìm thấy access token');

  const url = `https://plantai-731844417612.asia-east1.run.app/apps/multi_tool_agent/users/${userId}/sessions/${sessionId}`;
  const res = await axios.post(
    url,
    {
      state: {
        prefered_language: 'Vietnamese',
        visit_count: 1
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    }
  );
  return res.data;
}
