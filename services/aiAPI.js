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
  const prompt = `recognize this sample`.trim();

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