import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function logoutUser() {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token');
    }

    const url = 'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/auth/log-out';

    const res = await axios.post(
      url,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
      }
    );

    // Xóa token sau khi logout
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

    return res.data;
  } catch (err) {
    console.error('❌ Lỗi logout:', err?.response?.data || err.message);
    throw err;
  }
}
