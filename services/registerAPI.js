import axios from 'axios';

export async function registerUser({ name, email, password, avatarUri }) {
  const url = 'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/users';
  const formData = new FormData();

  formData.append('Name', name);
  formData.append('Email', email);
  formData.append('Password', password);

  if (avatarUri) {
    formData.append('Avatar', {
      uri: avatarUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });
  }

  try {
    const res = await axios.post(url, formData); 
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
