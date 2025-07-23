import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../services/registerAPI';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';

export default function RegisterScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      setErrorMsg('Không chọn được ảnh đại diện!');
    }
  }, []);

  const handleRegister = useCallback(async () => {
    setErrorMsg('');
    Keyboard.dismiss();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({ name: name.trim(), email: email.trim(), password, avatarUri });
      if (res?.is_success) {
        if (avatarUri) await AsyncStorage.setItem('avatar', avatarUri);
        navigation.goBack();
      } else {
        setErrorMsg(res?.message || 'Có lỗi xảy ra!');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Lỗi khi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  }, [name, email, password, avatarUri, navigation]);

  const formReady = name && email && password && !loading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={navigation.goBack} disabled={loading}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đăng Ký</Text>
        <View style={{ width: 26 }} />
      </View>

      <TextInput
        placeholder="Họ tên"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        value={name}
        onChangeText={setName}
        editable={!loading}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.avatarBtn}
        onPress={handlePickAvatar}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={[styles.avatarBtnText, { color: colors.link }]}>
          Chọn ảnh đại diện (tuỳ chọn)
        </Text>
      </TouchableOpacity>
      {avatarUri && (
        <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
      )}

      {!!errorMsg && (
        <Text style={[styles.errorText, { color: 'red' }]}>{errorMsg}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.registerBtn,
          { backgroundColor: colors.button, opacity: formReady ? 1 : 0.5 },
        ]}
        onPress={handleRegister}
        disabled={!formReady}
        activeOpacity={formReady ? 0.7 : 1}
      >
        {loading ? (
          <ActivityIndicator color={colors.buttonText} />
        ) : (
          <Text style={[styles.registerText, { color: colors.buttonText }]}>Đăng Ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} disabled={loading}>
        <Text style={[styles.loginText, { color: colors.link }]}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
  },
  input: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  avatarBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 2,
  },
  avatarBtnText: {
    fontSize: 15,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  registerBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  registerText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  loginText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});
