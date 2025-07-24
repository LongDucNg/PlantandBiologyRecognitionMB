import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

import { ThemeContext } from './ThemeContext';
import { lightTheme, darkTheme } from './theme';

export default function FeedbackScreen({ navigation }) {
  const [noiDung, setNoiDung] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // Gửi phản hồi
  const handleGuiPhanHoi = async () => {
    const noiDungGon = noiDung.trim();
    if (!noiDungGon) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }

    Keyboard.dismiss();
    setDangGui(true);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');

      let userId = '';
      try {
        const decoded = jwt_decode(accessToken);
        userId = decoded?.UserId || decoded?.userId || decoded?.sub;
        if (!userId) throw new Error();
      } catch {
        throw new Error('Thông tin đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
      }

      const formData = new FormData();
      formData.append('UserId', userId);
      formData.append('Message', noiDungGon);

      const res = await axios.post(
        'https://plantandbiologyrecognition-d3hychbvg8gjhvht.southeastasia-01.azurewebsites.net/api/v1/feedback/create',
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.status === 200) {
        Alert.alert('Thành công', 'Phản hồi của bạn đã được gửi. Xin cảm ơn!');
        setNoiDung('');
        navigation.goBack();
      } else {
        Alert.alert(
          'Thành công',
          res.data?.message || 'Phản hồi của bạn đã được gửi.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setNoiDung('');
      }
    } catch (err) {
      let msg = 'Lỗi không xác định. Vui lòng thử lại.';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) msg = err.message;
      Alert.alert('Lỗi', msg);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Phản hồi</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Nội dung phản hồi */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        placeholder="Nhập ý kiến, góp ý của bạn..."
        placeholderTextColor={colors.placeholder}
        value={noiDung}
        onChangeText={setNoiDung}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        editable={!dangGui}
        returnKeyType="done"
      />

      {/* Nút gửi */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.button }]}
        onPress={handleGuiPhanHoi}
        disabled={dangGui}
        activeOpacity={0.8}
      >
        {dangGui ? (
          <ActivityIndicator color={colors.buttonText} />
        ) : (
          <Text style={[styles.btnText, { color: colors.buttonText }]}>Gửi phản hồi</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
    lineHeight: 22
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
});
