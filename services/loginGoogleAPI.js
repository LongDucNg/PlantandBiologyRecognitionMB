import axios from "axios";

const BASE_URL =
  "https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/oauth2";

/**
 * @param {string} returnUrl - Redirect URL after successful login.
 * @returns {Promise<string>} Google login URL.
 */
export async function getGoogleLoginUrl(returnUrl = "/") {
  try {
    const res = await axios.get(`${BASE_URL}/google-login`, {
      params: { returnUrl },
    });

    const url =
      typeof res.data === "object" && res.data?.url
        ? res.data.url
        : typeof res.data === "string" && res.data.startsWith("http")
        ? res.data
        : res.request?.responseURL;

    if (!url) throw new Error("No login URL returned from server");
    return url;
  } catch (err) {
    console.error("Google login URL error:", err);
    throw new Error("Không thể lấy được Google OAuth URL!");
  }
}

/**
 * @param {{ code: string; state: string; returnUrl?: string }} params
 * @returns {Promise<{ accessToken?: string, refreshToken?: string, idToken?: string, user?: object }>}
 */
export async function googleResponse({ code, state, returnUrl = "/" }) {
  if (!code || !state)
    throw new Error("Thiếu mã xác thực từ Google (code hoặc state)!");

  try {
    const res = await axios.get(`${BASE_URL}/google-response`, {
      params: { code, state, returnUrl },
    });

    if (!res?.data || typeof res.data !== "object")
      throw new Error("Phản hồi không hợp lệ từ máy chủ");

    return res.data;
  } catch (err) {
    console.error("Google response error:", err);
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Xác thực Google thất bại!";
    throw new Error(msg);
  }
}
