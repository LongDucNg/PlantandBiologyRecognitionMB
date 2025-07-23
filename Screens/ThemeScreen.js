import React, { useContext, useCallback } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme } from './theme';

export default function ThemeScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.backBtn}
          accessibilityLabel="Quay lại"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Giao Diện</Text>
      </View>

      {/* Switch theme */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>
          Chế độ tối
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={handleToggle}
          trackColor={{ false: "#b3b3b3", true: colors.primary || "#4CAF50" }}
          thumbColor={theme === 'dark' ? colors.button : "#fff"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    marginRight: 12,
    padding: 5,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
});
