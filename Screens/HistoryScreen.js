import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      AsyncStorage.getItem('history')
        .then(raw => {
          if (mounted) {
            const arr = raw ? JSON.parse(raw) : [];
            setHistory(arr);
          }
        });
      return () => { mounted = false; };
    }, [])
  );

  const filtered = history.filter(item =>
    (!search ||
      (item.common && item.common.toLowerCase().includes(search.toLowerCase())) ||
      (item.scientific && item.scientific.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 28 },
    header: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: colors.text },
    searchRow: {
      flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 16
    },
    searchInput: {
      flex: 1,
      height: 36,
      backgroundColor: colors.input,
      borderRadius: 18,
      paddingHorizontal: 16,
      fontSize: 16,
      marginRight: 10,
      color: colors.text,
    },
    filterBtn: {
      width: 36, height: 36, backgroundColor: colors.input, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
    },
    sectionLabel: {
      fontWeight: 'bold', fontSize: 16, marginBottom: 4, marginLeft: 16, color: colors.text,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 14,
      elevation: 1,
      shadowColor: '#0002',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    thumb: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor: '#aaa',
      marginRight: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#eee',
    },
    info: { flex: 1, justifyContent: 'center' },
    common: { fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: colors.text },
    science: { fontSize: 14, color: colors.text },
    moreBtn: { marginLeft: 10, padding: 6 },
    emptyText: { textAlign: 'center', color: colors.text, fontSize: 16, marginTop: 36 }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lịch Sử</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm"
          placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionLabel}>Created Date</Text>
      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có lịch sử nhận diện</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={styles.thumb} />
              )}
              <View style={styles.info}>
                <Text style={styles.common}>{item.common || 'Chưa có tên'}</Text>
                <Text style={styles.science}>{item.scientific || ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.moreBtn}
                onPress={() => navigation.navigate('SampleDetails', { ...item })}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
