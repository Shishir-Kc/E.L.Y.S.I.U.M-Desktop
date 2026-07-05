/**
 * Port of `kSidebarItems` in `lib/widgets/sidebar.dart:17-26`.
 * IDs match the Flutter app so logic is unchanged.
 */
export interface SidebarItemDescriptor {
  id: string;
  label: string;
  icon: string; // MaterialIcons glyph name
}

export const SIDEBAR_ITEMS: SidebarItemDescriptor[] = [
  { id: 'chats',    label: 'Chats',    icon: 'chat-bubble-outline' },
  { id: 'memory',   label: 'Memory',    icon: 'memory' },
  { id: 'agents',   label: 'Agents',   icon: 'smart-toy' },
  { id: 'code',     label: 'Code',      icon: 'code' },
  { id: 'logs',     label: 'Logs',      icon: 'terminal' },
  { id: 'updates',  label: 'Updates',  icon: 'system-update-alt' },
  { id: 'workers',  label: 'Workers',  icon: 'engineering' },
  { id: 'email',    label: 'Email',    icon: 'mail-outline' },
];
