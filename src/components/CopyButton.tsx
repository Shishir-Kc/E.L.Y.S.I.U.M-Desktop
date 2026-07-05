/**
 * Small round copy icon button. Mirrors `_buildCopyButton` in
 * `lib/screens/chat_screen.dart:338-354`. Calls flashCopyToast on tap.
 */
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../config/theme';
import { copyToClipboard } from '../utils/clipboard';
import { useUIStore } from '../store/uiStore';

interface Props {
  text: string;
  size?: number;
  color?: string;
}

export const CopyButton: React.FC<Props> = ({ text, size = 14, color }) => {
  const flashCopyToast = useUIStore((s) => s.flashCopyToast);
  return (
    <Pressable
      onPress={() => {
        void copyToClipboard(text).then(() => flashCopyToast());
      }}
      style={({ pressed }) => [local.wrap, pressed && { opacity: 0.5 }]}
      hitSlop={8}
    >
      <MaterialIcons name="content-copy" size={size} color={color ?? colors.text_disabled} />
    </Pressable>
  );
};

const local = StyleSheet.create({
  wrap: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'flex-start',
  } as ViewStyle,
});
