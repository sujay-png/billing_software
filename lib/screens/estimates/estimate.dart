import 'package:billing_software/screens/estimates/modules/estimate_provider.dart';
import 'package:billing_software/screens/estimates/modules/estimatelist_Provider.dart';
import 'package:billing_software/screens/estimates/modules/searchprovider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class EstimateDashboard extends StatelessWidget {
  const EstimateDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SingleChildScrollView(
        child: Row(
          children: const [
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: DashboardContent(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardContent extends StatelessWidget {
  const DashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        HeaderSection(),
        SizedBox(height: 24),
        EstimatesTable(),
        SizedBox(height: 32),
       
      ],
    );
  }
}

/* ---------------- HEADER ---------------- */

class HeaderSection extends StatelessWidget {
  const HeaderSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [TopNavigation(), SizedBox(height: 32), TableHeaderRow()],
    );
  }
}

/* ---------------- TOP NAVIGATION ---------------- */

class TopNavigation extends ConsumerWidget {
  // Can be Stateless now!
  const TopNavigation({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        const Expanded(child: BreadcrumbSection()),
        Expanded(
          flex: 2,
          child: SearchBarWidget(
            onChanged: (value) {
              // Update the global provider state
              ref.read(estimateSearchProvider.notifier).state = value
                  .toLowerCase();
            },
          ),
        ),
      ],
    );
  }
}

class BreadcrumbSection extends StatelessWidget {
  const BreadcrumbSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Text(
          "Estimates",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF6B7280),
          ),
        ),
        SizedBox(width: 8),
        Text("/", style: TextStyle(fontSize: 16, color: Color(0xFF9CA3AF))),
        SizedBox(width: 8),
        Text(
          "All Estimates",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
          ),
        ),
      ],
    );
  }
}

class SearchBarWidget extends StatelessWidget {
  final ValueChanged<String> onChanged; // Callback to notify parent of changes

  const SearchBarWidget({super.key, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        height: 48,
        width: 420,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, size: 20, color: Color(0xFF9CA3AF)),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                onChanged: onChanged, // Trigger the callback on every keystroke
                decoration: const InputDecoration(
                  hintText: "Search estimates, customers...",
                  hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
                  border: InputBorder.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ---------------- SECOND ROW (Recent Estimates + Filter/Export) ---------------- */

class TableHeaderRow extends StatelessWidget {
  const TableHeaderRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          "Recent Estimates",
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
          ),
        ),
      ],
    );
  }
}

class ActionBtn extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback onTap;
  final Color? color;

  const ActionBtn({
    required this.label,
    required this.onTap,
    this.icon,
    this.color,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          // Uses the provided color with transparency, or default gray
          color: color?.withOpacity(0.1) ?? const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: color?.withOpacity(0.5) ?? const Color(0xFFE5E7EB),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: color ?? const Color(0xFF374151)),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: color ?? const Color(0xFF374151),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ---------------- TABLE ---------------- */

class EstimatesTable extends ConsumerWidget {
  const EstimatesTable({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final estimatesAsync = ref.watch(estimatesListProvider);
    final searchQuery = ref.watch(estimateSearchProvider).toLowerCase();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: estimatesAsync.when(
        loading: () => const Center(
          child: Padding(
            padding: EdgeInsets.all(32.0),
            child: CircularProgressIndicator(),
          ),
        ),
        error: (err, stack) => Center(child: Text("Error: $err")),
        data: (estimates) {
          // 1. Filter the list based on the search query
          final filteredEstimates = estimates.where((est) {
            final name = (est['customer_name'] ?? '').toString().toLowerCase();
            final number = (est['estimate_number'] ?? '')
                .toString()
                .toLowerCase();
            return name.contains(searchQuery) || number.contains(searchQuery);
          }).toList();

          if (filteredEstimates.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Text("No matching estimates found."),
              ),
            );
          }

          return Column(
            children: [
              const TableHeader(),
              const Divider(height: 1),
              // 2. Map the FILTERED list to UI rows
              ...filteredEstimates
                  .map(
                    (est) => Column(
                      children: [
                        TableRowItem(
                          _formatDate(est['estimate_date']),
                          est['estimate_number'] ?? 'N/A',
                          est['reference'] ?? '',
                          est['customer_name'] ?? 'N/A',
                          "\$${est['total']}",
                          est['status'] ?? 'Draft',
                        ),
                        const Divider(height: 1),
                      ],
                    ),
                  )
                  .toList(),
              const TableFooter(),
            ],
          );
        },
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return "N/A";
    final date = DateTime.parse(dateStr);
    return "${date.day}/${date.month}/${date.year}";
  }
}

class TableHeader extends StatelessWidget {
  const TableHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: const [
          Expanded(flex: 2, child: HeaderText("DATE")),
          Expanded(flex: 2, child: HeaderText("ESTIMATE #")),
          Expanded(flex: 3, child: HeaderText("CUSTOMER")),
          Expanded(flex: 2, child: HeaderText("AMOUNT")),
          Expanded(flex: 2, child: HeaderText("STATUS")),
          Expanded(flex: 1, child: HeaderText("ACTIONS")),
        ],
      ),
    );
  }
}

class HeaderText extends StatelessWidget {
  final String text;
  const HeaderText(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 12,
        letterSpacing: 1.2,
        fontWeight: FontWeight.w600,
        color: Color(0xFF9CA3AF),
      ),
    );
  }
}

class TableRowItem extends ConsumerWidget {
  final String date, id, reference, customer, amount, status;

  const TableRowItem(
    this.date,
    this.id,
    this.reference,
    this.customer,
    this.amount,
    this.status, {
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () {
        context.go('/estimates/$reference');
      },
      child: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Row(
          children: [
            Expanded(flex: 2, child: Text(date)),
            Expanded(
              flex: 2,
              child: Text(
                id,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            Expanded(flex: 3, child: Text(customer)),
            Expanded(
              flex: 2,
              child: Text(
                amount,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerLeft,
                child: StatusBadge(status: status),
              ),
            ),
            Expanded(
              flex: 1,
              child: Align(
                alignment: Alignment.centerRight,
                child: PopupMenuButton<String>(
                  // 1. Style the trigger icon
                  icon: const Icon(
                    Icons.more_vert,
                    size: 18,
                    color: Color(0xFF6B7280),
                  ),
                  padding: EdgeInsets.zero,
                  tooltip: "Actions",

                  // 2. Define the callback when an item is selected
                  onSelected: (String value) {
                    if (value == 'edit') {
                      context.go('/estimates/edit/$reference');
                    } else if (value == 'delete') {
                      // Trigger the confirm delete dialog we created earlier
                      _confirmDelete(context, ref, reference);
                    }
                  },

                  // 3. Build the menu items
                  itemBuilder: (BuildContext context) => [
                   
                    const PopupMenuItem<String>(
                      value: 'delete',
                      child: ListTile(
                        leading: Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: Colors.red,
                        ),
                        title: Text(
                          'Delete',
                          style: TextStyle(fontSize: 14, color: Colors.red),
                        ),
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    switch (status.toLowerCase()) {
      case 'sent':
        bgColor = const Color(0xFFE0E7FF);
        textColor = const Color(0xFF1D4ED8);
        break;
      case 'accepted':
        bgColor = const Color(0xFFD1FAE5);
        textColor = const Color(0xFF065F46);
        break;
      case 'declined':
        bgColor = const Color(0xFFFEE2E2);
        textColor = const Color(0xFF991B1B);
        break;
      default:
        bgColor = const Color(0xFFF3F4F6);
        textColor = const Color(0xFF374151);
    }

    return Align(
      alignment: Alignment.centerLeft, // important
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          status,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: textColor,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class TableFooter extends StatelessWidget {
  const TableFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 24),
     
    );
  }
}

/* ---------------- STATS ---------------- */



class StatCard extends StatelessWidget {
  final String title, value;
  const StatCard(this.title, this.value, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: Color(0xFF9CA3AF),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Color(0xFF111827),
            ),
          ),
        ],
      ),
    );
  }
}

//-----------------Confrim Delete--------------------//
void _confirmDelete(BuildContext context, WidgetRef ref, String refId) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text("Delete Estimate"),
      content: const Text(
        "Are you sure? This will also remove all line items.",
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text("Cancel"),
        ),
        TextButton(
          onPressed: () async {
            await ref.read(estimateProvider.notifier).deleteEstimate(refId);
            Navigator.pop(ctx);
          },
          child: const Text("Delete", style: TextStyle(color: Colors.red)),
        ),
      ],
    ),
  );
}
