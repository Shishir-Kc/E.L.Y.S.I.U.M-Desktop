/**
 * ToolsMenu — port of `_showToolsMenu` at `lib/screens/chat_screen.dart:749-807`.
 * Shows Generate Image / Generate Code tiles. Both are no-ops (TODO) per the
 * Flutter source.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';

interface ToolOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const TOOLS: ToolOption[] = [
  { id: 'image', label: 'Generate Image', description: 'Create AI art from text', icon: 'image', color: colors.text_medEmphasis },
  { id: 'code',  label: 'Generate Code',  description: 'Write snippets or functions', icon: 'code', color: colors.blueAccent },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ToolsMenu: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={local.backdrop} onPress={onClose}>
        <View style={local.card}>
          <View style={local.header}>
            <MaterialIcons name="grid-view" size={20} color={colors.text_medEmphasis} />
            <Text style={local.title}>Tools</Text>
          </View>
          {TOOLS.map((t, _i) => (
            <Pressable
              key={t.id}
              style={({ pressed }) => [local.row, pressed && { opacity: 0.7 }]}
              onPress={() => {
                onClose();
                // TODO: implement image/code gen (matches Flutter TODO)
              }}
            >
              <View style={[local.rowIcon, { backgroundColor: hex(t.color, 0.2) }]}>
                <MaterialIcons name={t.icon as any} size={24} color={t.color} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.lg }}>
                <Text style={local.rowLabel}>{t.label}</Text>
                <Text style={local.rowDesc}>{t.description}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={14} color="rgba(255,255,255,0.30)" />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

function hex(c: string, alpha: number): string {
  if (c.startsWith('rgba')) return c;
  if (c.startsWith('rgb')) return c.replace(/rgb\(([^)]*)\)/, (_, inner) => `rgba(${inner}, ${alpha})`);
  // assume #RRGGBB
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const local = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  card: {
    backgroundColor: colors.bgTool,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    paddingBottom: 36,
  } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 } as ViewStyle,
  title: {
    marginLeft: spacing.sm,
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: fontWeights.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWhite10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  } as ViewStyle,
  rowIcon: { padding: 12, borderRadius: 999 },
  rowLabel: { color: colors.text_primary, fontFamily: fonts.body, fontSize: 16, fontWeight: fontWeights.semibold },
  rowDesc: { color: 'rgba(255,255,255,0.54)', fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
});
