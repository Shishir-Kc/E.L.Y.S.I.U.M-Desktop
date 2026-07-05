/**
 * InputBar — the bottom composer row of ChatScreen.
 * Mirrors the Flutter input container at `lib/screens/chat_screen.dart:510-739`:
 *  - Model selector pill (left)
 *  - Tools (+) button
 *  - Mic button (toggles VoiceInputWidget)
 *  - Send / Live-conversation circular button (right)
 *
 * Submits text via `onSend`. Toggles model modal / tools sheet / mic via
 * callbacks. Stub for receiving the current draft text from the parent.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';
import { modelDisplayName } from '../config/models';

interface Props {
  draft: string;
  isTyping: boolean;
  isTranscribing: boolean;
  isRecording: boolean;
  selectedModelName: string;
  draftActive: boolean;
  onChangeDraft: (t: string) => void;
  onSubmit: () => void;
  onOpenModelPicker: () => void;
  onOpenTools: () => void;
  onStartRecording: () => void;
  onCancelRecording: () => void;
  onOpenLiveConversation: () => void;
}

export const InputBar: React.FC<Props> = (p) => {
  if (p.isRecording) {
    // The recording waveform widget takes this slot. ChatScreen renders it.
    return null;
  }
  return (
    <View style={local.wrap}>
      <View style={local.textbox}>
        <TextInput
          value={p.draft}
          multiline
          editable={!p.isTranscribing}
          placeholder={p.isTranscribing ? 'Transcribing audio...' : 'Ask anything...'}
          placeholderTextColor={p.isTranscribing ? colors.accentPrimary : colors.text_lowEmphasis}
          style={local.input}
          onChangeText={p.onChangeDraft}
          onSubmitEditing={p.onSubmit}
        />
        <View style={local.actions}>
          <Pressable style={local.modelPill} onPress={p.onOpenModelPicker}>
            <Text style={local.modelPillText}>{p.selectedModelName}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.text_primary} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={p.onOpenTools} style={local.toolBtn} hitSlop={8}>
            <MaterialIcons name="add-circle-outline" size={24} color={colors.text_medEmphasis} />
          </Pressable>
          <Pressable
            onPress={p.isTyping ? undefined : p.onStartRecording}
            disabled={p.isTyping}
            style={local.toolBtn}
            hitSlop={8}
          >
            <MaterialIcons
              name="mic"
              size={24}
              color={p.isTyping ? colors.text_disabled : colors.text_medEmphasis}
            />
          </Pressable>
          {p.draftActive ? (
            <Pressable
              onPress={p.isTyping ? undefined : p.onSubmit}
              disabled={p.isTyping}
              style={[local.sendBtn, p.isTyping && { backgroundColor: colors.bgSurfaceContainerHighest }]}
            >
              {p.isTyping ? <MaterialIcons name="hourglass-empty" color={colors.text_disabled} size={20} /> : <MaterialIcons name="arrow-upward" size={20} color={p.isTyping ? 'rgba(255,255,255,0.38)' : colors.text_primary} />}
            </Pressable>
          ) : (
            <Pressable
              onPress={p.isTyping ? undefined : p.onOpenLiveConversation}
              disabled={p.isTyping}
              style={[local.sendBtn, { backgroundColor: '#000' }, p.isTyping && { opacity: 0.3 }]}
            >
              <MaterialIcons name="graphic-eq" size={20} color={p.isTyping ? colors.text_disabled : colors.text_primary} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  wrap: { padding: 16 } as ViewStyle,
  textbox: {
    backgroundColor: colors.bgSurfaceContainerHighest,
    borderRadius: radii.bubble,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  } as ViewStyle,
  input: {
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 36,
  },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16 } as ViewStyle,
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTool,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderWhite10,
    paddingHorizontal: 12,
    height: 32,
  } as ViewStyle,
  modelPillText: {
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: fontWeights.medium as '500',
    marginRight: 4,
  } as TextStyle,
  toolBtn: { marginLeft: spacing.sm, padding: 4 } as ViewStyle,
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
  } as ViewStyle,
});
void modelDisplayName;
