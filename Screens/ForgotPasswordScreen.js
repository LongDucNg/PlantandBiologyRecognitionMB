import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';
import { sendOtpEmail, resetPassword } from '../services/forgotPasswordAPI';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const showMessage = () => (
    <>
      {!!errorMsg && <Text style={[styles.messageText, { color: 'red' }]}>{errorMsg}</Text>}
      {!!successMsg && <Text style={[styles.messageText, { color: 'green' }]}>{successMsg}</Text>}
    </>
  );

  const handleSendEmail = async () => {
    if (!email.includes('@')) {
      setErrorMsg('Vui lòng nhập email hợp lệ.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await sendOtpEmail(email);
    setLoading(false);

    if (res.is_success) {
      setStep(2);
      setSuccessMsg('OTP đã được gửi đến email.');
    } else {
      setErrorMsg(res.message || 'Không thể gửi OTP.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || newPassword.length < 6) {
      setErrorMsg('Vui lòng nhập OTP và mật khẩu (ít nhất 6 ký tự).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await resetPassword({ email, otpCode: otp, newPassword });
    setLoading(false);

    if (res.is_success) {
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại.', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') },
      ]);
    } else {
      setErrorMsg(res.message || 'Không thể đặt lại mật khẩu.');
    }
  };

  const renderStep1 = () => (
    <>
      <TextInput
        placeholder="Nhập Email"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      {showMessage()}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.button }]}
        onPress={handleSendEmail}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.buttonText} />
          : <Text style={[styles.buttonText, { color: colors.buttonText }]}>Gửi OTP</Text>}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <TextInput
        placeholder="Mã OTP"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        editable={!loading}
      />
      <TextInput
        placeholder="Mật khẩu mới"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!loading}
      />
      {showMessage()}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.button }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.buttonText} />
          : <Text style={[styles.buttonText, { color: colors.buttonText }]}>Đặt lại mật khẩu</Text>}
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quên Mật Khẩu</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={{ marginTop: 18 }}>
        {step === 1 ? renderStep1() : renderStep2()}
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
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  messageText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});
