// services/feedbackAPI.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function sendFeedback({ userId, message }) {
  const cleanedMessage = message.trim();
  if (!cleanedMessage) {
    throw new Error('Nội dung phản hồi không được để trống!');
  }

  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Không tìm thấy token. Bạn cần đăng nhập lại.');
  }

  const formData = new FormData();
  formData.append('UserId', userId);
  formData.append('Message', cleanedMessage);

  const response = await axios.post(
    'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/feedback/create',
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // ❗ KHÔNG đặt Content-Type ở đây, axios sẽ tự tạo cùng boundary cho FormData
      },
    }
  );

  return response.data;
}
