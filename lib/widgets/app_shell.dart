import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: Row(
        children: [
          _PrimarySidebar(location: location),
          _SecondarySidebar(location: location),
          Expanded(child: child),
        ],
      ),
    );
  }
}

/* ================= PRIMARY SIDEBAR ================= */

class _PrimarySidebar extends StatelessWidget {
  final String location;

  const _PrimarySidebar({required this.location});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Column(
        children: [
          const SizedBox(height: 28),

          _icon(
            context,
            icon: Icons.receipt_long,
            selected: location.startsWith('/estimates'),
            onTap: () => context.go('/estimates'),
          ),

          const SizedBox(height: 20),

          _icon(
            context,
            icon: Icons.inventory_2_outlined,
            selected: location.startsWith('/items'),
            onTap: () => context.go('/items'),
          ),
        ],
      ),
    );
  }

  Widget _icon(BuildContext context,
      {required IconData icon,
      required bool selected,
      required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 44,
        width: 44,
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFFFF4E6) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          color: selected ? const Color(0xFFF97316) : Colors.grey,
        ),
      ),
    );
  }
}

/* ================= SECONDARY SIDEBAR ================= */

class _SecondarySidebar extends StatelessWidget {
  final String location;

  const _SecondarySidebar({required this.location});

  @override
  Widget build(BuildContext context) {
    bool isItems = location.startsWith('/items');
    bool isEstimates = location.startsWith('/estimates');

    return Container(
      width: 240,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isItems ? "Items" : "Estimates",
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 24),

          if (isItems)
            _menuItem(
              context,
              title: "Add New Item",
              selected: location == '/items/add',
              onTap: () => context.go('/items/add'),
            ),

          if (isEstimates)
            _menuItem(
              context,
              title: "Add New Estimate",
              selected: location == '/estimates/create',
              onTap: () => context.go('/estimates/create'),
            ),
        ],
      ),
    );
  }

  Widget _menuItem(BuildContext context,
      {required String title,
      required bool selected,
      required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFFFF4E6) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: selected
                ? const Color(0xFFF97316)
                : const Color(0xFF374151),
          ),
        ),
      ),
    );
  }
}