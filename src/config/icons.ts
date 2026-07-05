/**
 * Icon name constants (MaterialIcons font via react-native-vector-icons).
 * Mirrors the IconData references used across the Flutter widgets.
 *
 * react-native-vector-icons exposes MaterialIcons by glyph name; we keep the
 * names matching so swapping icon libraries is a one-line change.
 */
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type IconName = string;

// Convenience — returns a styled icon component bound to MaterialIcons.
export const MaterialIcon = MaterialIcons;
