import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class EstimateDashboard extends StatelessWidget {
  const EstimateDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: Row(
        children: const [
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: DashboardContent(),
            ),
          ),
        ],
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
        StatsSection(),
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

class TopNavigation extends StatelessWidget {
  const TopNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Expanded(child: BreadcrumbSection()),
        Expanded(flex: 2, child: SearchBarWidget()),
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
  const SearchBarWidget({super.key});

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
          children: const [
            Icon(Icons.search, size: 20, color: Color(0xFF9CA3AF)),
            SizedBox(width: 12),
            Expanded(
              child: TextField(
                decoration: InputDecoration(
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
        Row(children: [ActionBtn("Filter"), const SizedBox(width: 12)]),
      ],
    );
  }
}

class ActionBtn extends StatelessWidget {
  final String label;
  const ActionBtn(this.label, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF374151),
        ),
      ),
    );
  }
}

/* ---------------- TABLE ---------------- */

class EstimatesTable extends StatelessWidget {
  const EstimatesTable({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: const [
          TableHeader(),
          Divider(height: 1),
          TableRowItem(
            "Oct 24, 2023",
            "EST-001",
            "Acme Corp",
            "\$1,200.00",
            "Sent",
          ),
          Divider(height: 1),
          TableRowItem(
            "Oct 23, 2023",
            "EST-002",
            "Global Tech",
            "\$4,500.00",
            "Accepted",
          ),
          Divider(height: 1),
          TableRowItem(
            "Oct 22, 2023",
            "EST-003",
            "Orbit Inc",
            "\$850.00",
            "Draft",
          ),
          Divider(height: 1),
          TableRowItem(
            "Oct 21, 2023",
            "EST-004",
            "Studio Design",
            "\$2,100.00",
            "Sent",
          ),
          Divider(height: 1),
          TableRowItem(
            "Oct 20, 2023",
            "EST-005",
            "Nexus Ltd",
            "\$3,300.00",
            "Declined",
          ),
          Divider(height: 1),
          TableFooter(),
        ],
      ),
    );
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

class TableRowItem extends StatelessWidget {
  final String date, id, customer, amount, status;

  const TableRowItem(
    this.date,
    this.id,
    this.customer,
    this.amount,
    this.status, {
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.go('/estimates/$id');
      },
      child: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Row(
          children: [
            Expanded(flex: 2, child: Text(date)),
            Expanded(
                flex: 2,
                child: Text(id,
                    style: const TextStyle(fontWeight: FontWeight.w600))),
            Expanded(flex: 3, child: Text(customer)),
            Expanded(
                flex: 2,
                child: Text(amount,
                    style: const TextStyle(fontWeight: FontWeight.w600))),
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerLeft,
                child: StatusBadge(status: status),
              ),
            ),
            const Expanded(
              flex: 1,
              child: Align(
                alignment: Alignment.centerRight,
                child: Icon(Icons.more_vert, size: 18),
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
      child: const Text(
        "Showing 5 of 24 estimates",
        style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
      ),
    );
  }
}

/* ---------------- STATS ---------------- */

class StatsSection extends StatelessWidget {
  const StatsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Expanded(child: StatCard("TOTAL OUTSTANDING", "\$12,450.00")),
        SizedBox(width: 24),
        Expanded(child: StatCard("ACCEPTANCE RATE", "82%")),
        SizedBox(width: 24),
        Expanded(child: StatCard("AVG. RESPONSE TIME", "1.2 Days")),
      ],
    );
  }
}

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
