import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// A single entry in the sidebar.
class SidebarItem {
  final String id;
  final String label;
  final IconData icon;

  const SidebarItem({
    required this.id,
    required this.label,
    required this.icon,
  });
}

const List<SidebarItem> kSidebarItems = [
  SidebarItem(id: 'chats', label: 'Chats', icon: Icons.chat_bubble_outline_rounded),
  SidebarItem(id: 'memory', label: 'Memory', icon: Icons.memory_rounded),
  SidebarItem(id: 'agents', label: 'Agents', icon: Icons.smart_toy_outlined),
  SidebarItem(id: 'code', label: 'Code', icon: Icons.code_rounded),
  SidebarItem(id: 'logs', label: 'Logs', icon: Icons.terminal_rounded),
  SidebarItem(id: 'updates', label: 'Updates', icon: Icons.system_update_alt_rounded),
  SidebarItem(id: 'workers', label: 'Workers', icon: Icons.engineering_rounded),
  SidebarItem(id: 'email', label: 'Email', icon: Icons.mail_outline_rounded),
];

/// A collapsible left navigation sidebar for E.L.Y.S.I.U.M.
class Sidebar extends StatelessWidget {
  /// Currently selected item id.
  final String selectedId;

  /// Called when the user taps an item.
  final ValueChanged<String> onItemSelected;

  /// Whether the sidebar is expanded.
  final bool expanded;

  /// Called when the user taps the Settings button.
  final VoidCallback onSettingsPressed;

  const Sidebar({
    super.key,
    required this.selectedId,
    required this.onItemSelected,
    required this.expanded,
    required this.onSettingsPressed,
  });

  @override
  Widget build(BuildContext context) {
    final width = expanded ? 220.0 : 64.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      width: width,
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        border: Border(
          right: BorderSide(color: Colors.white.withOpacity(0.06)),
        ),
      ),
      child: Column(
        children: [
          // Header / brand + collapse toggle
          SizedBox(
            height: 64,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  // Logo mark
                  Container(
                    height: 32,
                    width: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F1F1F),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: const Center(
                      child: Text(
                        'E',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  if (expanded) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'E.L.Y.S.I.U.M',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0xFF1F1F1F)),

          // Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                ...kSidebarItems.map((item) => _buildItem(context, item)),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFF1F1F1F)),

          // Settings button at the bottom
          _buildSettingsButton(context),
        ],
      ),
    );
  }

  Widget _buildItem(BuildContext context, SidebarItem item) {
    final selected = item.id == selectedId;

    final tile = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onItemSelected(item.id),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          padding: EdgeInsets.symmetric(
            horizontal: expanded ? 12 : 0,
            vertical: 10,
          ),
          decoration: BoxDecoration(
            color: selected ? const Color(0xFF1F1F1F) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: selected
                  ? Colors.white.withOpacity(0.08)
                  : Colors.transparent,
            ),
          ),
          child: Row(
            mainAxisAlignment: expanded
                ? MainAxisAlignment.start
                : MainAxisAlignment.center,
            children: [
              Icon(
                item.icon,
                size: 20,
                color: selected
                    ? Colors.white
                    : Colors.white54,
              ),
              if (expanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: selected ? Colors.white : Colors.white70,
                      fontSize: 13,
                      fontWeight:
                          selected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );

    // Only show a tooltip when collapsed (label is hidden).
    if (expanded) return tile;
    return Tooltip(
      message: item.label,
      preferBelow: false,
      child: tile,
    );
  }

  Widget _buildSettingsButton(BuildContext context) {
    return Tooltip(
      message: 'Settings',
      preferBelow: false,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onSettingsPressed,
          borderRadius: BorderRadius.zero,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            child: Row(
              mainAxisAlignment: expanded
                  ? MainAxisAlignment.spaceBetween
                  : MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.settings_rounded,
                  size: 20,
                  color: Colors.white54,
                ),
                if (expanded)
                  Text(
                    'Settings',
                    style: GoogleFonts.inter(
                      color: Colors.white54,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
