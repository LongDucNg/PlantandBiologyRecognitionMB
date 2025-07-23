import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';
import { UserContext } from '../context/UserContext';
import { loginUser } from '../services/loginAPI';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { theme } = useContext(ThemeContext);
  const { setUser } = useContext(UserContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleAuthSuccess = async ({ accessToken, refreshToken }) => {
    try {
      if (!accessToken || !refreshToken) throw new Error('Token không hợp lệ');

      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);

      const decoded = jwt_decode(accessToken);
      console.log('📄 Token:', decoded);

      setUser({
        id: decoded.sub || decoded.id || decoded.user_id,
        email: decoded.email,
        name: decoded.name || decoded.full_name,
        picture: decoded.picture || decoded.avatar,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Trang chủ' }],
      });
    } catch (err) {
      console.error('❌ Auth error:', err);
      setErrorMsg('Không thể xử lý đăng nhập.');
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ email, password });

      if (result?.is_success) {
        const { accessToken, refreshToken } = result.data;
        await handleAuthSuccess({ accessToken, refreshToken });
      } else {
        setErrorMsg(result?.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setErrorMsg(err.message || 'Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Hồ Sơ', {
        screen: 'ProfileMain'
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Đăng Nhập</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={{ marginTop: 18 }}>
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
          placeholder="Mật Khẩu"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {!!errorMsg && (
          <Text style={[styles.errorText, { color: 'red' }]}>{errorMsg}</Text>
        )}

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.button }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.buttonText} />
            : <Text style={[styles.loginText, { color: colors.buttonText }]}>Đăng Nhập</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ marginTop: 14, alignItems: 'center' }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>
      </View>
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
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  loginText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  errorText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});
