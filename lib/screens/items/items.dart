import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

void main() {
  runApp(
    const MaterialApp(
      home: ItemsDashboard(),
      debugShowCheckedModeBanner: false,
    ),
  );
}

class ItemsDashboard extends StatelessWidget {
  const ItemsDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTopActionBar(context),
            const SizedBox(height: 32),
            _buildSummaryRow(),
            const SizedBox(height: 32),
            _buildInventoryTable(),
          ],
        ),
      ),
    );
  }

  // 1. Search and Add Item Header
  Widget _buildTopActionBar(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: const TextField(
              decoration: InputDecoration(
                prefixIcon: Icon(Icons.search, color: Colors.grey, size: 20),
                hintText: "Search inventory...",
                hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        _buildFilterButton(),
        const SizedBox(width: 16),
        ElevatedButton.icon(
          onPressed: () {
            context.go('/items/add');
          },
          icon: const Icon(Icons.add, size: 18),
          label: const Text(
            "Add New Item",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFF97316),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterButton() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: const [
          Icon(Icons.filter_list, size: 18, color: Colors.blueGrey),
          SizedBox(width: 8),
          Text(
            "Filters",
            style: TextStyle(
              color: Colors.blueGrey,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // 2. Summary Statistics Cards
  Widget _buildSummaryRow() {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            title: "TOTAL ITEMS",
            value: "1,240",
            subText: "↑ 5% from last month",
            subColor: Colors.green,
          ),
        ),
        const SizedBox(width: 24),
        Expanded(
          child: _StatCard(
            title: "LOW STOCK",
            value: "12",
            subText: "⚠ Critical attention",
            subColor: Colors.orange,
          ),
        ),
        const SizedBox(width: 24),
        Expanded(
          child: _StatCard(
            title: "OUT OF STOCK",
            value: "3",
            subText: "Pending restock",
            subColor: Colors.red,
          ),
        ),
        const SizedBox(width: 24),
        Expanded(
          child: _StatCard(
            title: "TOTAL VALUATION",
            value: "\$42,850.00",
            subText: "Current market rate",
            subColor: Colors.blueGrey,
          ),
        ),
      ],
    );
  }

  // 3. Main Inventory Table
  Widget _buildInventoryTable() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _buildTableHeader(),
          const Divider(height: 1),
          _InventoryRow(
            sku: "SKU-9921",
            name: "Wireless Mouse PRO",
            category: "ELECTRONICS",
            rate: "\$45.00",
            status: "In Stock (120)",
            statusColor: Colors.green,
          ),
          const Divider(height: 1),
          _InventoryRow(
            sku: "SKU-8842",
            name: "Ergonomic Office Chair",
            category: "FURNITURE",
            rate: "\$299.99",
            status: "Low Stock (8)",
            statusColor: Colors.orange,
          ),
          const Divider(height: 1),
          _InventoryRow(
            sku: "SKU-7731",
            name: "Mechanical Keyboard V2",
            category: "ELECTRONICS",
            rate: "\$89.00",
            status: "In Stock (45)",
            statusColor: Colors.green,
          ),
          const Divider(height: 1),
          _InventoryRow(
            sku: "SKU-1120",
            name: "Privacy Screen Filter",
            category: "OFFICE SUPPLIES",
            rate: "\$24.50",
            status: "Out of Stock (0)",
            statusColor: Colors.red,
          ),
          const Divider(height: 1),
          _InventoryRow(
            sku: "SKU-5541",
            name: "USB-C Hub (7-in-1)",
            category: "ELECTRONICS",
            rate: "\$59.00",
            status: "In Stock (22)",
            statusColor: Colors.green,
          ),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      color: const Color(0xFFFBFBFB),
      child: Row(
        children: const [
          SizedBox(
            width: 24,
            child: Icon(
              Icons.check_box_outline_blank,
              size: 18,
              color: Colors.grey,
            ),
          ),
          SizedBox(width: 100, child: Text("SKU", style: _headerStyle)),
          Expanded(flex: 3, child: Text("ITEM NAME", style: _headerStyle)),
          Expanded(flex: 2, child: Text("CATEGORY", style: _headerStyle)),
          SizedBox(width: 100, child: Text("RATE", style: _headerStyle)),
          Expanded(flex: 2, child: Text("STOCK STATUS", style: _headerStyle)),
          SizedBox(
            width: 80,
            child: Text(
              "ACTIONS",
              textAlign: TextAlign.right,
              style: _headerStyle,
            ),
          ),
        ],
      ),
    );
  }

  static const _headerStyle = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Color(0xFF64748B),
    letterSpacing: 0.5,
  );
}

// --- Helper Components ---

class _StatCard extends StatelessWidget {
  final String title, value, subText;
  final Color subColor;
  const _StatCard({
    required this.title,
    required this.value,
    required this.subText,
    required this.subColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subText,
            style: TextStyle(
              fontSize: 12,
              color: subColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _InventoryRow extends StatelessWidget {
  final String sku, name, category, rate, status;
  final Color statusColor;
  const _InventoryRow({
    required this.sku,
    required this.name,
    required this.category,
    required this.rate,
    required this.status,
    required this.statusColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          const SizedBox(
            width: 24,
            child: Icon(
              Icons.check_box_outline_blank,
              size: 18,
              color: Colors.grey,
            ),
          ),
          SizedBox(
            width: 100,
            child: Text(
              sku,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              name,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: UnconstrainedBox(
              alignment: Alignment.centerLeft,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  category,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF475569),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
            width: 100,
            child: Text(
              rate,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Row(
              children: [
                CircleAvatar(radius: 4, backgroundColor: statusColor),
                const SizedBox(width: 8),
                Text(
                  status,
                  style: TextStyle(
                    fontSize: 13,
                    color: statusColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 80,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: const [
                Icon(Icons.edit_outlined, size: 18, color: Colors.blueGrey),
                SizedBox(width: 12),
                Icon(Icons.delete_outline, size: 18, color: Colors.blueGrey),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
