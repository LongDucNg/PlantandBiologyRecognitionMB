import React, { useContext, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import { ThemeContext } from '../Screens/ThemeContext';
import { lightTheme, darkTheme } from '../Screens/theme';

const safeParseJSON = (raw) => {
  if (typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (str.startsWith('data:')) str = str.replace(/^data:\s*/, '');
  try { return JSON.parse(str); } catch { return raw; }
};

function parseRecogInfo(recogResult) {
  const parsed = safeParseJSON(recogResult);
  if (typeof parsed !== 'object' || !parsed) return { summary: 'Không có dữ liệu phù hợp' };

  const parts = parsed?.content?.parts;
  if (!Array.isArray(parts)) return { summary: 'Không có dữ liệu phù hợp' };

  for (const part of parts) {
    const data = part?.functionResponse?.response?.data;
    if (data) {
      const item = Array.isArray(data.items) && data.items.length ? data.items[0] : data;
      return {
        commonName: item?.name || '',
        scientificName: item?.scientificName || '',
        type: item?.type || '',
        classification: item?.classification || '',
        biology: item?.biology || '',
        summary: item?.summary || '',
        description: item?.description || '',
        textbook: item?.textbook || '',
      };
    }
  }

  const textPart = parts.find(p => typeof p.text === 'string');
  if (!textPart) return { summary: 'Không có dữ liệu phù hợp' };
  let rawText = textPart.text.trim();

  const inlineJson = rawText.match(/\{[\s\S]*?\}/);
  if (inlineJson) {
    try {
      const d = JSON.parse(inlineJson[0]);
      return {
        commonName: d.name || '',
        scientificName: d.scientificName || '',
        type: d.type || '',
        classification: d.classification || '',
        biology: d.biology || '',
        summary: d.summary || '',
        description: d.description || '',
        textbook: d.textbook || '',
      };
    } catch { }
  }

  const extract = (regs, txt = rawText) => regs.map(r => txt.match(r)).find(m => m?.[1])?.[1]?.trim() || '';
  return {
    commonName: extract([/Tên\s*phổ\s*thông\s*[:\-]\s*([^\n]+)/i]),
    scientificName: extract([/Tên\s*khoa\s*học\s*[:\-]\s*([^\n]+)/i]),
    type: extract([/Loại\s*[:\-]\s*([^\n]+)/i]),
    classification: extract([/Phân loại\sinh học\s*[:\-]\s*([^\n]+)/i]),
    biology: extract([/Đặc điểm sinh học\s*[:\-]\s*([\s\S]*?)(?:\n\S|$)/i]),
    summary: extract([/Tóm tắt sơ bộ\s*[:\-]\s*([^\n]+)/i]) || rawText,
    description: extract([/Mô tả\s*[:\-]\s*([\s\S]*)/i]),
    textbook: extract([/SGK\s*THPT\s*[:\-]\s*([^\n]+)/i]),
  };
}

const renderValue = v => v && v.trim() ? v : 'Chưa có dữ liệu';

export default function ResultScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const isFromHistory = params?.fromHistory === true;
  const image = params?.image;
  const recogResult = params?.recogResult;
  const info = useMemo(() => {
    try {
      return isFromHistory ? params?.info || {} : parseRecogInfo(recogResult) || {};
    } catch {
      return { summary: 'Không có dữ liệu phù hợp' };
    }
  }, [recogResult, isFromHistory]);

  useEffect(() => {
    if (isFromHistory || !info?.scientificName?.trim()) return;

    const saveHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem('recognitionHistory');
        const arr = raw ? JSON.parse(raw) : [];

        const newItem = {
          id: uuid.v4(),
          timestamp: Date.now(),
          image,
          info,
        };

        const updated = [newItem, ...arr];
        await AsyncStorage.setItem('recognitionHistory', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi lưu lịch sử:', err);
      }
    };

    saveHistory();
  }, [image, info, isFromHistory]);

  const renderItem = (label, value, isLink = false) =>
    value && value.trim() ? (
      <>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[
          isLink ? styles.textbookLink : styles.value,
          isLink ? null : { color: colors.text }
        ]}>
          {value}
        </Text>
      </>
    ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Trở lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.block, { backgroundColor: colors.card }]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.resultImg} resizeMode="cover" />
          ) : (
            <View style={styles.resultImg}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text }}>(Ảnh)</Text>
            </View>
          )}
        </View>
        <View style={[styles.blockInfo, { backgroundColor: colors.card }]}>
          {renderItem('Tên phổ thông:', info.commonName)}
          {renderItem('Tên khoa học:', info.scientificName)}
          {renderItem('Loại:', info.type)}
          {renderItem('Phân loại sinh học:', info.classification)}
          {renderItem('Tóm tắt sơ bộ:', info.summary)}
          {renderItem('Mô tả:', info.description)}
          {renderItem('Đặc điểm sinh học:', info.biology)}
          {renderItem('SGK THPT:', info.textbook, true)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'right',
    flex: 1,
  },
  block: {
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 10,
    alignItems: 'center',
    marginBottom: 14,
    minHeight: 120,
    justifyContent: 'center',
  },
  resultImg: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockInfo: {
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 18,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    marginBottom: 4,
  },
  textbookLink: {
    fontSize: 15,
    color: '#0072d2',
    marginTop: 2,
  },
});
