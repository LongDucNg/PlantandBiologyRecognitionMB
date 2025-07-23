// services/clientAPI.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const clientAPI = axios.create();

clientAPI.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clientAPI.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry thì thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(
          'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/refresh-token',
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newToken = response.data?.accessToken;
        if (newToken) {
          await AsyncStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return clientAPI(originalRequest);
        }
      } catch (refreshError) {
        console.log('Refresh token thất bại:', refreshError.message);
      }
    }

    return Promise.reject(error);
  }
);

export default clientAPI;
