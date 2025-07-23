import React, { useContext, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';

const BAD_EXAMPLES = [
  { source: require('../assets/close.jpg'), label: 'Quá gần' },
  { source: require('../assets/far.jpg'), label: 'Quá xa' },
  { source: require('../assets/multi.jpg'), label: 'Nhiều cây quá' },
];

// React.memo để tránh render lại thừa
const BadExample = memo(function BadExample({ source, label, labelColor }) {
  return (
    <View style={styles.badBox}>
      <Image source={source} style={styles.badImg} />
      <View style={styles.badMark}>
        <Text style={styles.badIcon}>✗</Text>
      </View>
      <Text style={[styles.badLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
});

export default function InfoScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const badLabelColor = theme === 'dark' ? '#fff' : '#222';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Mẹo nhận diện chính xác</Text>
      <Text style={[styles.desc, { color: colors.subtext }]}>
        Đặt cây vào vị trí dễ quan sát, chụp rõ nét để tăng khả năng nhận diện
      </Text>

      {/* Ảnh tốt */}
      <View style={styles.rowCenter}>
        <View style={[styles.goodBox, { borderColor: colors.text }]}>
          <Image source={require('../assets/good.jpg')} style={styles.goodImg} />
          <View style={styles.check}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>
      </View>

      {/* Ảnh xấu (dùng map) */}
      <View style={styles.rowBad}>
        {BAD_EXAMPLES.map(item => (
          <BadExample
            key={item.label}
            source={item.source}
            label={item.label}
            labelColor={badLabelColor}
          />
        ))}
      </View>

      {/* Nút đóng */}
      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: colors.button }]}
        onPress={navigation.goBack}
        activeOpacity={0.7}
        accessible accessibilityLabel="Đóng màn hình mẹo nhận diện"
      >
        <Text style={[styles.doneText, { color: colors.buttonText }]}>Đã hiểu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  rowCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  goodBox: {
    borderWidth: 6,
    borderRadius: 100,
    padding: 4,
    position: 'relative',
  },
  goodImg: {
    width: 170,
    height: 170,
    borderRadius: 90,
  },
  check: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rowBad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  badBox: {
    alignItems: 'center',
    width: 90,
    position: 'relative',
  },
  badImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 6,
  },
  badMark: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  badIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  badLabel: {
    fontSize: 14,
    marginTop: 3,
    textAlign: 'center',
  },
  doneBtn: {
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
  },
  doneText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
