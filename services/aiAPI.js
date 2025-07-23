import apiClient from './clientAPI'; 

/**
 * @param {Object} params
 * @param {string} params.userId 
 * @param {string} params.sessionId 
 * @param {string} params.base64Image 
 * @returns {Promise<Object>} 
 */
export async function recognizePlant({ userId, sessionId, base64Image }) {
  const url = 'https://plantai-731844417612.asia-east1.run.app/run_sse';
  const prompt = `
Identify the object in the image and provide information in Vietnamese (nếu có). 
Return ONLY a valid JSON object with exactly these fields:
- name: tên phổ thông (Vietnamese common name)
- scientificName: tên khoa học (scientific name)
- type: loại sinh vật (e.g., thực vật, động vật, vật thể)
- classification: phân loại sinh học (nếu có)
- summary: tóm tắt sơ bộ
- description: mô tả chi tiết
- biology: đặc điểm sinh học, vòng đời, sinh thái, giải phẫu (nếu có)
- textbook: nguồn tham khảo SGK/bài học (nếu có)

Do NOT return markdown, NO explanations or commentary, just the JSON object.
If any field is unknown or not available, still include the key with empty string ("").
All fields are required.
Example:
{
  "name": "Mai vàng",
  "scientificName": "Ochna integerrima",
  "type": "thực vật",
  "classification": "Magnoliopsida, Malpighiales, Ochnaceae",
  "summary": "Mai vàng là loài hoa nổi bật ở Việt Nam.",
  "description": "Mai vàng là cây thân gỗ, hoa màu vàng, sống chủ yếu ở Nam bộ.",
  "biology": "Ra hoa cuối Đông, lá rụng mùa Thu...",
  "textbook": "Sinh học 11 cơ bản"
}
  `.trim();

  const body = {
    app_name: 'multi_tool_agent',
    user_id: userId,
    session_id: sessionId,
    new_message: {
      role: 'user',
      parts: [
        {
          text: prompt
        },
        {
          inlineData: {
            data: base64Image,
            displayName: 'image.jpeg',
            mimeType: 'image/jpeg'
          }
        }
      ]
    },
    streaming: false
  };

  const response = await apiClient.post(url, body);
  return response.data;
}
