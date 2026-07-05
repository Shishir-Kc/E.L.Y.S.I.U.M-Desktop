/**
 * One row in the sidebar. Mirrors `_buildItem` in `lib/widgets/sidebar.dart:135-199`.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';
import { SidebarItemDescriptor } from '../config/sidebarItems';

interface Props {
  item: SidebarItemDescriptor;
  selected: boolean;
  expanded: boolean;
  onPress: () => void;
}

export const SidebarItem: React.FC<Props> = ({ item, selected, expanded, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        local.tile,
        expanded ? local.tileExpanded : local.tileCollapsed,
        selected && local.selected,
        pressed && { opacity: 0.7 },
      ]}
    >
      <MaterialIcons
        name={item.icon as any}
        size={20}
        color={selected ? colors.text_primary : colors.text_lowEmphasis}
      />
      {expanded ? (
        <Text
          numberOfLines={1}
          style={[
            local.label,
            { color: selected ? colors.text_primary : colors.text_medEmphasis },
          ]}
        >
          {item.label}
        </Text>
      ) : null}
    </Pressable>
  );
};

const local = StyleSheet.create({
  tile: {
    marginHorizontal: 8,
    marginVertical: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,
  tileExpanded: { justifyContent: 'flex-start', paddingHorizontal: 12 },
  tileCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  selected: {
    backgroundColor: colors.bgSurfaceContainerHighest,
    borderColor: colors.borderMed,
  } as ViewStyle,
  label: {
    marginLeft: spacing.md,
    fontSize: 13,
    fontFamily: fonts.body,
    fontWeight: fontWeights.regular,
  },
});
