/**
 * ModelSelectorModal — port of `lib/widgets/model_selector_modal.dart`.
 * Modal with header, search input, and a scrollable list of model rows.
 * Each row shows the description (large) and a pill with the name.
 */
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';
import { MODELS, ModelId } from '../config/models';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelected: (id: ModelId) => void;
}

export const ModelSelectorModal: React.FC<Props> = ({ visible, onClose, onSelected }) => {
  const [query, setQuery] = React.useState('');
  const filtered = MODELS.filter((m) => {
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={local.backdrop}>
        <View style={local.card}>
          <Header onClose={onClose} />
          <View style={local.divider} />
          <View style={local.searchWrap}>
            <View style={local.searchBox}>
              <MaterialIcons name="search" size={20} color={colors.text_lowEmphasis} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search models..."
                placeholderTextColor={colors.text_lowEmphasis}
                style={local.searchInput}
              />
            </View>
          </View>
          <View style={local.listWrap}>
            {filtered.length === 0 ? (
              <Text style={local.empty}>No models found.</Text>
            ) : (
              filtered.map((m) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [local.row, pressed && { backgroundColor: colors.bgToolHover }]}
                  onPress={() => {
                    onSelected(m.id);
                    onClose();
                  }}
                >
                  <Text style={local.rowDesc} numberOfLines={1}>{m.description}</Text>
                  <View style={local.pill}>
                    <Text style={local.pillText}>{m.name}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Header: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <View style={local.header}>
    <MaterialIcons name="psychology" size={20} color={colors.text_lowEmphasis} />
    <Text style={local.headerText}>Select Model</Text>
    <View style={{ flex: 1 }} />
    <Pressable onPress={onClose} hitSlop={8}>
      <MaterialIcons name="close" size={20} color={colors.text_lowEmphasis} />
    </Pressable>
  </View>
);

const local = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  } as ViewStyle,
  card: {
    maxWidth: 600,
    maxHeight: 500,
    width: '100%',
    backgroundColor: colors.bgSurfaceVariant,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.bgUserBubble,
    overflow: 'hidden',
  } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 } as ViewStyle,
  headerText: {
    marginLeft: spacing.sm,
    color: colors.text_highEmphasis,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeights.medium,
  },
  divider: { height: 1, backgroundColor: colors.bgUserBubble } as ViewStyle,
  searchWrap: { padding: 16 } as ViewStyle,
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38,38,38,0.5)',
    borderRadius: radii.md,
    paddingHorizontal: 12,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    color: colors.text_highEmphasis,
    fontFamily: fonts.body,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 12,
  },
  listWrap: { paddingHorizontal: 8, paddingBottom: 8 } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginVertical: 2,
  } as ViewStyle,
  rowDesc: {
    flex: 1,
    color: colors.text_highEmphasis,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  pill: {
    backgroundColor: colors.bgUserBubble,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#404040',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  } as ViewStyle,
  pillText: {
    color: colors.text_highEmphasis,
    fontSize: 12,
    fontFamily: fonts.body,
    fontWeight: fontWeights.medium,
  },
  empty: {
    color: colors.text_lowEmphasis,
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
