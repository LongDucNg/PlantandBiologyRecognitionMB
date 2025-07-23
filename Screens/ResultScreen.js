import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
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
      if (data.name || data.scientificName) {
        return {
          commonName: data.name || '',
          scientificName: data.scientificName || '',
          type: data.type || '',
          classification: data.classification || '',
          biology: data.biology || '',
          summary: data.summary || '',
          description: data.description || '',
          textbook: data.textbook || '',
        };
      }
      if (Array.isArray(data.items) && data.items.length) {
        const item = data.items[0];
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
    commonName: extract([
      /Tên\s*phổ\s*thông\s*[:\-]\s*([^\n]+)/i,
      /commonly known as (?:the )?\*\*([^\*]+)\*\*/,
    ]),
    scientificName: extract([
      /Tên\s*khoa\s*học\s*[:\-]\s*([^\n]+)/i,
      /scientific name is \*{1,3}([^\*]+?)\*{1,3}/i,
    ]),
    type: extract([/Loại\s*(?:mẫu\s*vật)?\s*[:\-]\s*([^\n]+)/i]),
    classification: extract([
      /Phân loại sinh học\s*[:\-]\s*([^\n]+)/i
    ]),
    biology: extract([
      /Đặc điểm sinh học\s*[:\-]\s*([\s\S]*?)(?:\n\S|$)/i
    ]),
    summary: extract([/Tóm tắt sơ bộ\s*[:\-]\s*([^\n]+)/i]) || rawText,
    description: extract([/Mô tả\s*[:\-]\s*([\s\S]*)/i]),
    textbook: extract([/SGK\s*THPT\s*[:\-]\s*([^\n]+)/i]),
  };
}

const renderValue = v => v && v.trim() ? v : 'Chưa có dữ liệu';

export default function ResultScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const { image, recogResult } = params;

  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const info = useMemo(() => {
    try { return parseRecogInfo(recogResult) || {}; }
    catch { return { summary: 'Không có dữ liệu phù hợp' }; }
  }, [recogResult]);

  // Dùng lại renderItem gọn gàng, hiện phân cách nếu có trường trước đó (optional)
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
        {/* Ảnh */}
        <View style={[styles.block, { backgroundColor: colors.card }]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.resultImg} resizeMode="cover" />
          ) : (
            <View style={styles.resultImg}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text }}>(Ảnh)</Text>
            </View>
          )}
        </View>
        {/* Info */}
        <View style={[styles.blockInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tên phổ thông:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{renderValue(info.commonName)}</Text>

          <Text style={[styles.label, { color: colors.text }]}>Tên khoa học:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{renderValue(info.scientificName)}</Text>

          <Text style={[styles.label, { color: colors.text }]}>Loại:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{renderValue(info.type)}</Text>

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
