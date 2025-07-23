import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';

// Hàm parse JWT, dùng Buffer nếu cần thiết, fallback atob cho Web
const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Hỗ trợ cả mobile và web
    let jsonPayload;
    if (typeof Buffer !== 'undefined') {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    } else if (typeof atob === 'function') {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      return null;
    }
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function AccountInfoScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // Lấy email từ token
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const decoded = parseJwt(token);
        if (isMounted) setEmail(decoded?.email || 'Chưa xác định');
      } catch {
        if (isMounted) setEmail('Chưa xác định');
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Xoá tài khoản (token)
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Xác nhận xoá tài khoản',
      'Hành động này sẽ xoá mọi dữ liệu của bạn. Bạn có chắc chắn không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            } finally {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Trang chủ' }],
              });
            }
          },
        },
      ]
    );
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.box, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          <Ionicons name="mail-outline" size={20} color={colors.text} />  Email
        </Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
          {email}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.box, { backgroundColor: colors.card }]}
        onPress={handleDeleteAccount}
        activeOpacity={0.7}
      >
        <Text style={[styles.deleteLabel, { color: colors.text }]}>Xoá Tài Khoản</Text>
        <Text style={[styles.deleteSub, { color: colors.placeholder }]}>
          Hành động này sẽ xoá mọi dữ liệu của bạn.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  backBtn: {
    marginBottom: 10,
  },
  box: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0002',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
  },
  deleteLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  deleteSub: {
    fontSize: 14,
  },
});
