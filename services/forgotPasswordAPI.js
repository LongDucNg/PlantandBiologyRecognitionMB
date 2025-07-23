import axios from 'axios';

const API_BASE = 'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1';

export const sendOtpEmail = async (email) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
    return {
      is_success: res.data.is_success,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    const err = error.response?.data;
    return {
      is_success: false,
      message: err?.message || 'Không thể gửi OTP',
      reason: err?.reason || '',
    };
  }
};

export const resetPassword = async ({ email, otpCode, newPassword }) => {
  try {
    const res = await axios.post(`${API_BASE}/reset-password`, {
      email,
      otpCode,
      newPassword,
    });
    return {
      is_success: res.data.is_success,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    const err = error.response?.data;
    return {
      is_success: false,
      message: err?.message || 'Không thể đặt lại mật khẩu',
      reason: err?.reason || '',
    };
  }
};
