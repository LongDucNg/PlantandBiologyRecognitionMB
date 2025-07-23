import React, { useContext, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';
import { UserContext } from '../context/UserContext';
import { createSession } from '../services/createSessionAPI';
import { recognizePlant } from '../services/aiAPI';

const window = Dimensions.get('window');

export default function RecognitionScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const image = route.params?.image;
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { user } = useContext(UserContext);

  const userId = user?.id;
  const sessionId = useMemo(
    () => (userId ? `session_${userId}` : null),
    [userId]
  );

  const [loading, setLoading] = useState(false);

  const handleRecog = useCallback(async () => {
    if (!image) {
      Alert.alert('Lỗi', 'Không có ảnh để nhận diện!');
      return;
    }
    if (!userId || !sessionId) {
      Alert.alert('Không xác định được tài khoản', 'Vui lòng đăng nhập lại.');
      return;
    }
    setLoading(true);

    try {
      // Chuyển ảnh sang base64
      const base64Img = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Tạo session cho user (bỏ qua nếu đã tồn tại)
      try {
        await createSession(userId, sessionId);
      } catch (err) {
        if (
          err?.response?.data?.detail?.includes('Session already exists')
        ) {
          // Session đã tồn tại, tiếp tục
        } else {
          throw err;
        }
      }

      // Nhận diện thực vật
      const recogResult = await recognizePlant({
        userId,
        sessionId,
        base64Image: base64Img,
      });

      setLoading(false);

      navigation.navigate('Result', {
        image,
        recogResult,
      });
    } catch (err) {
      setLoading(false);
      if (err?.response) {
        Alert.alert(
          'Nhận diện thất bại',
          `[${err?.response?.status}] ${err?.response?.data?.message || JSON.stringify(err?.response?.data)}`
        );
      } else {
        Alert.alert(
          'Nhận diện thất bại',
          err?.message || 'Đã có lỗi khi nhận diện. Vui lòng thử lại sau!'
        );
      }
    }
  }, [image, userId, sessionId, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: colors.card }]}
        onPress={navigation.goBack}
        disabled={loading}
        activeOpacity={0.55}
        accessibilityLabel="Đóng màn hình nhận diện"
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* Hiển thị ảnh/placeholder */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.imgFull}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.imgFull, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.imageLabel, { color: colors.text }]}>(Chưa có ảnh)</Text>
        </View>
      )}

      {/* Indicator loading */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            Đang nhận diện...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.recogBtn,
          { backgroundColor: colors.button, borderColor: colors.border },
          (!image || loading) && styles.btnDisabled,
        ]}
        onPress={handleRecog}
        disabled={!image || loading}
        activeOpacity={0.7}
        accessibilityLabel="Thực hiện nhận diện"
      >
        <Text style={[styles.recogText, { color: colors.buttonText }]}>Nhận diện</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 26,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#0001',
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  imgFull: {
    flex: 1,
    width: window.width,
    height: window.height,
    backgroundColor: '#000',
  },
  imageLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  recogBtn: {
    position: 'absolute',
    right: 24,
    bottom: 85,
    borderRadius: 16,
    paddingHorizontal: 36,
    paddingVertical: 18,
    shadowColor: '#0002',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1.5,
    zIndex: 11,
  },
  recogText: {
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
