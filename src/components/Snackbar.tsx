/**
 * Centered bottom notification that pops in when the user copies text or audio
 * transcription fails. Mirrors the AnimatedOpacity notification in
 * `lib/screens/chat_screen.dart:459-507`.
 *
 * Reads visibility from uiStore.showCopyToast; messages are mostly static
 * ("Copied to clipboard") so we don't store dynamic content. For transient
 * error toasts we expose an imperative helper via `flashSnackbar(message)`.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors, fonts, fontWeights, radii } from '../config/theme';
import { useUIStore } from '../store/uiStore';

let lastMessage = 'Copied to clipboard';

export const Snackbar: React.FC = () => {
  const visible = useUIStore((s) => s.showCopyToast);
  const opacity = useSharedValue(0);
  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [visible, opacity]);
  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({ opacity: opacity.value, transform: [{ translateY: visible ? 0 : 6 }] }));
  return (
    <View pointerEvents="none" style={local.wrap}>
      <Animated.View style={[local.card, animatedStyle]}>
        <MaterialIcons name="check-circle" size={16} color={colors.greenAccent} />
        <Text style={local.text}>{lastMessage}</Text>
      </Animated.View>
    </View>
  );
};

export function setSnackbarMessage(text: string): void {
  lastMessage = text;
}

const local = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  } as ViewStyle,
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.bgTool,
    borderWidth: 1,
    borderColor: colors.borderWhite10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle,
  text: {
    marginLeft: 8,
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: fontWeights.medium,
  },
});
