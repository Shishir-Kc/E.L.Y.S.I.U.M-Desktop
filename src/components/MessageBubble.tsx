/**
 * One chat message row — mirrors `_buildMessageItem` at
 * `lib/screens/chat_screen.dart:247-336`.
 *
 * User messages render as plain text in a dark bubble (max width 85%).
 * Bot messages render through MarkdownRenderer and skip the bubble background
 * but get a faint border. A CopyButton sits below every message (same as the
 * Flutter `_buildCopyButton`).
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, fontWeights, radii } from '../config/theme';
import { ChatMessage } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';

interface Props {
  message: ChatMessage;
  maxWidth: number; // 85% of viewport width, passed by parent
}

export const MessageBubble: React.FC<Props> = ({ message, maxWidth }) => {
  return (
    <View style={[local.row, message.isUser ? local.rowUser : local.rowBot]}>
      <View style={[local.bubble, message.isUser ? local.bubbleUser : local.bubbleBot, { maxWidth }]}>
        {message.isUser ? (
          <Text style={local.userText}>{message.text}</Text>
        ) : (
          <MarkdownRenderer text={message.text} />
        )}
      </View>
      <View style={local.copyRow}>
        <CopyButton text={message.text} />
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  row: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  rowUser: { alignItems: 'flex-end' },
  rowBot: { alignItems: 'flex-start' },
  bubble: {
    padding: 12,
    borderRadius: radii.md,
  } as ViewStyle,
  bubbleUser: {
    backgroundColor: colors.bgUserBubble,
  } as ViewStyle,
  bubbleBot: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderWhite10,
  } as ViewStyle,
  userText: {
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  copyRow: {
    marginTop: 4,
  } as ViewStyle,
});
void fontWeights;
