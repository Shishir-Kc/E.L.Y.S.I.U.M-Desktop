/**
 * Collapsible left sidebar. Responsive variant of Flutter `Sidebar` widget:
 *  - On web OR width >= 768px: visible rail, expand/collapse with animated width.
 *  - On phones (width < 768): rendered inside the DrawerContent by parent.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { colors, fonts, fontWeights, layout, radii, spacing } from '../config/theme';
import { SIDEBAR_ITEMS } from '../config/sidebarItems';
import { useUIStore, SidebarItemId } from '../store/uiStore';
import { SidebarItem } from './SidebarItem';

const forcedExpandedCenter: 'center' | 'flex-start' = 'center';

interface Props {
  onSelect?: (id: SidebarItemId) => void;
  forcedExpanded?: boolean;
}

export const Sidebar: React.FC<Props> = ({ onSelect, forcedExpanded }) => {
  const { width } = useWindowDimensions();
  const expanded = useUIStore((s) => (forcedExpanded ? true : s.sidebarExpanded)) ||
    (forcedExpanded ?? false);
  const selectedId = useUIStore((s) => s.selectedSidebarItem);
  const selectItem = useUIStore((s) => s.selectItem);

  void width;

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const target = expanded ? layout.sidebarExpandedWidth : layout.sidebarCollapsedWidth;
    return { width: withTiming(target, { duration: 220, easing: Easing.out(Easing.cubic) }) };
  });

  return (
    <Animated.View style={[local.root, animatedStyle]}>
      <View style={local.header}>
        <View style={local.logo}>
          <Text style={local.logoText}>E</Text>
        </View>
        {expanded ? <Text style={local.brand}>E.L.Y.S.I.U.M</Text> : null}
      </View>
      <View style={local.divider} />
      <View style={local.items}>
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            expanded={expanded}
            onPress={() => {
              selectItem(item.id as SidebarItemId);
              onSelect?.(item.id as SidebarItemId);
            }}
          />
        ))}
      </View>
      <View style={local.divider} />
      <View style={local.settingsRow}>
        <Pressable onPress={() => onSelect?.('settings' as SidebarItemId)} style={local.settingsBtn}>
          <MaterialIcons name="settings" size={20} color={colors.text_lowEmphasis} />
          {expanded ? <Text style={local.settingsLabel}>Settings</Text> : null}
        </Pressable>
      </View>
    </Animated.View>
  );
};

const local = StyleSheet.create({
  root: {
    backgroundColor: colors.bgSidebar,
    borderRightWidth: 1,
    borderRightColor: colors.borderSoft,
    overflow: 'hidden',
  } as ViewStyle,
  header: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 } as ViewStyle,
  logo: {
    height: 32, width: 32, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.borderMed,
    backgroundColor: colors.bgSurfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
  logoText: { color: colors.text_primary, fontSize: 16, fontWeight: fontWeights.bold } as TextStyle,
  brand: {
    marginLeft: spacing.md, color: colors.text_primary,
    fontFamily: fonts.display, fontSize: 15,
    fontWeight: fontWeights.semibold, letterSpacing: 0.5,
  } as TextStyle,
  divider: { height: 1, backgroundColor: colors.divider } as ViewStyle,
  items: { paddingVertical: 8, flex: 1 } as ViewStyle,
  settingsRow: {} as ViewStyle,
  settingsBtn: {
    paddingVertical: 12, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: forcedExpandedCenter,
  } as ViewStyle,
  settingsLabel: {
    marginLeft: spacing.md, color: colors.text_lowEmphasis,
    fontFamily: fonts.body, fontSize: 12,
  } as TextStyle,
});


