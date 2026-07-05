/**
 * Code block renderer used as a rule by MarkdownRenderer.
 * Renders the code text in a dark box with monospace font and a Copy button in
 * the top-right corner — directly mirrors the Flutter `PreConfig.wrapper` in
 * `lib/screens/chat_screen.dart:287-325`.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts } from '../config/theme';
import { copyToClipboard } from '../utils/clipboard';
import { useUIStore } from '../store/uiStore';

interface Props {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<Props> = ({ code, language }) => {
  const flashCopyToast = useUIStore((s) => s.flashCopyToast);
  const onCopy = () => {
    void copyToClipboard(code).then(() => flashCopyToast());
  };
  return (
    <View style={local.container}>
      {language ? <Text style={local.lang}>{language}</Text> : null}
      <Pressable onPress={onCopy} hitSlop={8} style={local.copyBtn} accessibilityRole="button" accessibilityLabel="Copy code">
        <MaterialIcons name="content-copy" size={16} color={colors.text_medEmphasis} />
      </Pressable>
      <Text style={local.codeText}>{code}</Text>
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.codeBg,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.codeBorder,
  } as ViewStyle,
  lang: {
    color: colors.text_disabled,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginBottom: 6,
    textTransform: 'lowercase',
  },
  copyBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  } as ViewStyle,
  codeText: {
    color: colors.text_primary,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
});
