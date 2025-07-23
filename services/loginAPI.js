import axios from 'axios';

const BASE_URL = 'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/auth';
const TIMEOUT = 40000;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/plain',
  },
});

export async function loginUser({ email, password }) {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (err) {
    console.error('==> Login Error:', err.message, err.code, err.response?.data);
    throw err.response?.data || {
      message: 'Lỗi không xác định khi đăng nhập',
      is_success: false,
    };
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    const response = await api.post('/refresh-token', { refreshToken });
    return response.data;
  } catch (err) {
    console.error('==> Refresh Token Error:', err.message, err.code, err.response?.data);
    throw err.response?.data || {
      message: 'Lỗi không xác định khi refresh token',
      is_success: false,
    };
  }
}
