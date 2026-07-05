/**
 * Markdown renderer wrapping `react-native-markdown-display`.
 * Configures styles to match the Flutter `MarkdownConfig`:
 *  - paragraphs: Inter, white70 colour
 *  - code blocks: dark with copy button (CodeBlock component)
 *
 * Mirrors the styling in `chat_screen.dart:277-329`.
 */
import React from 'react';
import Markdown, { MarkdownProps } from 'react-native-markdown-display';
import { StyleSheet } from 'react-native';
import { colors, fonts, fontWeights } from '../config/theme';
import { CodeBlock } from './CodeBlock';

const rules: MarkdownProps['rules'] = {
  code_block: (node: Record<string, any>) => {
    const lang = (node.sourceInfo ?? node.lang ?? '') as string;
    return (
      <CodeBlock
        key={node.key}
        code={node.content ?? ''}
        language={lang || undefined}
      />
    );
  },
};

const mdStyles = StyleSheet.create({
  body: { color: colors.text_medEmphasis, fontFamily: fonts.body, fontSize: 15 },
  paragraph: { color: colors.text_medEmphasis, fontFamily: fonts.body, fontSize: 15, marginTop: 4, marginBottom: 4 },
  heading1: { color: colors.text_primary, fontFamily: fonts.display, fontWeight: fontWeights.semibold, fontSize: 26, marginTop: 12, marginBottom: 4 },
  heading2: { color: colors.text_primary, fontFamily: fonts.display, fontWeight: fontWeights.semibold, fontSize: 22, marginTop: 10, marginBottom: 4 },
  heading3: { color: colors.text_primary, fontFamily: fonts.display, fontWeight: fontWeights.semibold, fontSize: 19, marginTop: 8, marginBottom: 4 },
  heading4: { color: colors.text_highEmphasis, fontFamily: fonts.display, fontWeight: fontWeights.semibold, fontSize: 17, marginTop: 6, marginBottom: 2 },
  heading5: { color: colors.text_highEmphasis, fontFamily: fonts.display, fontWeight: fontWeights.medium, fontSize: 15, marginTop: 4, marginBottom: 2 },
  heading6: { color: colors.text_medEmphasis, fontFamily: fonts.display, fontWeight: fontWeights.medium, fontSize: 14, marginTop: 4, marginBottom: 2 },
  code_inline: {
    fontFamily: fonts.mono,
    color: colors.text_primary,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 13,
  },
  bullet_list: { marginVertical: 6 },
  ordered_list: { marginVertical: 6 },
  list_item: { marginVertical: 4, flexDirection: 'row', flexWrap: 'wrap' as any },
  link: { color: colors.blueAccent, textDecorationLine: 'underline' as const },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.borderMed,
    paddingLeft: 12,
    color: colors.text_medEmphasis,
    marginVertical: 6,
  },
});

export const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  return <Markdown rules={rules as any} style={mdStyles as any}>{text}</Markdown>;
};
