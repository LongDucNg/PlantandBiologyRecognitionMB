import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../services/logoutAPI';
import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  useFocusEffect(
    React.useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        const storedAvatar = await AsyncStorage.getItem('avatar');
        setIsLoggedIn(!!token);
        setAvatarUrl(storedAvatar);
      };
      checkLogin();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      Alert.alert('Đăng xuất thành công');
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileMain' }],
      });
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
      Alert.alert('Lỗi', err?.message || 'Đã có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Hồ Sơ</Text>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>TÀI KHOẢN</Text>

      {!isLoggedIn ? (
        <>
          <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.itemText, { color: colors.text }]}>Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('SignIn')}>
            <Text style={[styles.itemText, { color: colors.text }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.accountBox, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.accountItem} onPress={() => navigation.navigate('AccInfo')}>
            <View style={styles.row}>
              <Image
                source={{ uri: avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                style={styles.avatar}
              />
              <Text style={[styles.accountText, { color: colors.text }]}>Tài Khoản</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.accountItem} onPress={handleLogout}>
            <View style={styles.row}>
              <Ionicons name="log-out-outline" size={22} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={[styles.accountText, { color: colors.text }]}>Đăng Xuất</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={[styles.sectionLabel, { color: colors.text }]}>CÀI ĐẶT</Text>
      <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Theme')}>
        <Text style={[styles.itemText, { color: colors.text }]}>Giao Diện</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={[styles.sectionLabel, { color: colors.text }]}>KHÁC</Text>
      <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Feedback')}>
        <Text style={[styles.itemText, { color: colors.text }]}>Gửi Phản Hồi</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.card }]}
        onPress={() => Linking.openURL('https://prismatic-gumption-101e5a.netlify.app/privacy-policy.html')}
      >
        <Text style={[styles.itemText, { color: colors.text }]}>Chính Sách Bảo Mật</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.card }]}
        onPress={() => Linking.openURL('https://prismatic-gumption-101e5a.netlify.app/terms.html')}
      >
        <Text style={[styles.itemText, { color: colors.text }]}>Điều Khoản & Điều Kiện</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 28, paddingHorizontal: 0 },
  header: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  sectionLabel: { marginLeft: 22, marginTop: 14, fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  divider: {
    height: 2,
    backgroundColor: '#222',
    opacity: 0.16,
    marginHorizontal: 20,
    marginVertical: 18,
    borderRadius: 1,
  },
  item: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    elevation: 1,
    shadowColor: '#0002',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  itemText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  accountBox: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#0002',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accountItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
