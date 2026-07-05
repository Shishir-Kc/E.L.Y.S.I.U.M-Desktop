/**
 * SettingsModal — direct port of `_showSettingsDialog` at
 * `lib/screens/chat_screen.dart:867-938`. Same dark bordered card with a
 * "Settings coming soon" placeholder body.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={local.backdrop}>
        <View style={local.card}>
          <View style={local.header}>
            <MaterialIcons name="settings" size={20} color={colors.text_lowEmphasis} />
            <Text style={local.title}>Settings</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={20} color={colors.text_lowEmphasis} />
            </Pressable>
          </View>
          <View style={local.divider} />
          <View style={local.body}>
            <Text style={local.placeholder}>Settings coming soon</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const local = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  } as ViewStyle,
  card: {
    maxWidth: 480,
    maxHeight: 520,
    width: '100%',
    backgroundColor: colors.bgSurfaceVariant,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.bgUserBubble,
    overflow: 'hidden',
  } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 } as ViewStyle,
  title: {
    marginLeft: spacing.sm,
    color: colors.text_highEmphasis,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeights.medium,
  },
  divider: { height: 1, backgroundColor: colors.bgUserBubble } as ViewStyle,
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  placeholder: {
    color: colors.text_lowEmphasis,
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
