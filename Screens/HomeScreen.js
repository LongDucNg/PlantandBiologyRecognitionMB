import React, { useEffect, useState, useRef } from 'react';
import {
  View, ActivityIndicator, Text, TouchableOpacity, Image,
  Platform, PermissionsAndroid, StyleSheet
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import photoIcon from '../assets/photo_icon.png';

export default function HomeScreen() {
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
          setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasCameraPermission(status === 'granted');
        }
      } catch (error) {
        console.warn('Permission error:', error);
        setHasCameraPermission(false);
      }
    };

    requestPermissions();

    return () => {
      cameraRef.current?.pausePreview();
    };
  }, []);

  useEffect(() => {
    if (cameraRef.current) {
      if (!isFocused) {
        cameraRef.current.pausePreview();
      } else if (cameraReady) {
        cameraRef.current.resumePreview();
      }
    }
  }, [isFocused, cameraReady]);

  const toggleFlash = () => {
    setFlashMode(prev => (prev === 'off' ? 'torch' : 'off'));
  };

  const switchCamera = () => {
    setCameraType(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const openGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Bạn cần cấp quyền truy cập ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      navigation.navigate('Recognition', { image: result.assets[0].uri });
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        if (photo?.uri) {
          navigation.navigate('Recognition', { image: photo.uri });
        }
      } catch (err) {
        console.warn('Take picture error:', err);
      }
    }
  };

  if (hasCameraPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Đang chuẩn bị camera...</Text>
      </View>
    );
  }

  if (!hasCameraPermission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Không có quyền camera.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <>
          <CameraView
            style={styles.camera}
            cameraType={cameraType}
            flash={flashMode}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
            onMountError={(e) => console.warn('Camera error:', e)}
          />

          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Ionicons name={flashMode === 'off' ? 'flash-off' : 'flash'} size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={switchCamera}>
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </TouchableOpacity>

          <View pointerEvents="none" style={styles.overlay}>
            <View style={styles.tl} /><View style={styles.tr} />
            <View style={styles.bl} /><View style={styles.br} />
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={openGallery} style={styles.galleryBtn}>
              <Image source={photoIcon} style={styles.galleryIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.capture}
              onPress={takePicture}
              disabled={!cameraReady}
            >
              <View style={styles.outer}><View style={styles.inner} /></View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Info')} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={42} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const size = 52, thick = 5, radius = 18;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flashButton: {
    position: 'absolute', top: 40, left: 24, backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22, padding: 8, zIndex: 10,
  },
  switchButton: {
    position: 'absolute', top: 40, right: 24, backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22, padding: 8, zIndex: 10,
  },
  overlay: { position: 'absolute', top: '22%', left: 0, right: 0, bottom: '28%', zIndex: 9 },
  tl: { position: 'absolute', left: 32, top: 0, width: size, height: size, borderLeftWidth: thick, borderTopWidth: thick, borderTopLeftRadius: radius, borderColor: 'white' },
  tr: { position: 'absolute', right: 32, top: 0, width: size, height: size, borderRightWidth: thick, borderTopWidth: thick, borderTopRightRadius: radius, borderColor: 'white' },
  bl: { position: 'absolute', left: 32, bottom: 0, width: size, height: size, borderLeftWidth: thick, borderBottomWidth: thick, borderBottomLeftRadius: radius, borderColor: 'white' },
  br: { position: 'absolute', right: 32, bottom: 0, width: size, height: size, borderRightWidth: thick, borderBottomWidth: thick, borderBottomRightRadius: radius, borderColor: 'white' },
  bottomBar: {
    position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 48, zIndex: 10,
  },
  galleryBtn: {
    width: 54, height: 54, borderRadius: 15, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#ededed',
  },
  galleryIcon: { width: 34, height: 34, borderRadius: 8 },
  capture: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  outer: {
    width: 92, height: 92, borderRadius: 50, borderWidth: 4,
    borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  inner: { width: 72, height: 72, borderRadius: 40, backgroundColor: '#fff' },
  infoButton: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
});
