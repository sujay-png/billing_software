import 'package:flutter/material.dart';

void main() {
  runApp(const MaterialApp(
    home: ItemsDashboard(),
    debugShowCheckedModeBanner: false,
  ));
}

class ItemsDashboard extends StatefulWidget {
  const ItemsDashboard({super.key});

  @override
  State<ItemsDashboard> createState() => _ItemsDashboardState();
}

class _ItemsDashboardState extends State<ItemsDashboard> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // RESTORED: Top action bar with the Add button
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

  // Action bar containing search and the navigation button
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
        ElevatedButton.icon(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const AddItemScreen()),
            );
          },
          icon: const Icon(Icons.add, size: 18),
          label: const Text("Add New Item", style: TextStyle(fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFF97316),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow() {
    return Row(
      children: [
        Expanded(child: _StatCard(title: "TOTAL ITEMS", value: "1,240", subText: "↑ 5% from last month", subColor: Colors.green)),
        const SizedBox(width: 24),
        Expanded(child: _StatCard(title: "LOW STOCK", value: "12", subText: "⚠ Critical attention", subColor: Colors.orange)),
        const SizedBox(width: 24),
        Expanded(child: _StatCard(title: "OUT OF STOCK", value: "3", subText: "Pending restock", subColor: Colors.red)),
        const SizedBox(width: 24),
        Expanded(child: _StatCard(title: "TOTAL VALUATION", value: "₹42,850.00", subText: "Current market rate", subColor: Colors.blueGrey)),
      ],
    );
  }

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
          const _InventoryRow(sku: "SKU-9921", name: "Wireless Mouse PRO", category: "ELECTRONICS", rate: "₹3,700.00", status: "In Stock (120)", statusColor: Colors.green),
          const Divider(height: 1),
          const _InventoryRow(sku: "SKU-8842", name: "Ergonomic Office Chair", category: "FURNITURE", rate: "₹24,500.00", status: "Low Stock (8)", statusColor: Colors.orange),
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
          SizedBox(width: 100, child: Text("SKU", style: _headerStyle)),
          Expanded(flex: 3, child: Text("ITEM NAME", style: _headerStyle)),
          Expanded(flex: 2, child: Text("CATEGORY", style: _headerStyle)),
          SizedBox(width: 120, child: Text("RATE", style: _headerStyle)),
          Expanded(flex: 2, child: Text("STOCK STATUS", style: _headerStyle)),
          SizedBox(width: 80, child: Text("ACTIONS", textAlign: TextAlign.right, style: _headerStyle)),
        ],
      ),
    );
  }

  static const _headerStyle = TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5);
}

// --- Add New Item Screen ---
class AddItemScreen extends StatelessWidget {
  const AddItemScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
   appBar: AppBar(
  title: const Text(
    "Add New Item",
    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
  ),
  centerTitle: true, // Ensures the heading is centered
  backgroundColor: Colors.white,
  elevation: 0.5,
  automaticallyImplyLeading: false, // This removes the back arrow icon
),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 100, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Create a new product or service in your inventory database.", style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            _buildGeneralInfoSection(),
            const SizedBox(height: 24),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _buildPricingSection()),
                const SizedBox(width: 24),
                Expanded(child: _buildStockSection()),
              ],
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(), 
                  child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () {
                    // Your Save Logic here
                    Navigator.of(context).pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Save Item", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildGeneralInfoSection() {
    return _FormCard(
      title: "General Information",
      icon: Icons.info_outline,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFieldLabel("Item Name"),
          TextField(decoration: _inputDecoration("e.g. Wireless Ergonomic Mouse")),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel("SKU / Item Code"),
                    TextField(decoration: _inputDecoration("WEM-001-BL")),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel("Category"),
                    TextField(decoration: _inputDecoration("Enter category...")), 
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildFieldLabel("Description"),
          TextField(maxLines: 4, decoration: _inputDecoration("Brief details for internal records...")),
        ],
      ),
    );
  }

  Widget _buildPricingSection() {
    return _FormCard(
      title: "Pricing",
      icon: Icons.payments_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFieldLabel("Rate / Price (INR)"),
          TextField(
            keyboardType: TextInputType.number,
            decoration: _inputDecoration("0.00").copyWith(prefixText: "₹ "), 
          ),
          const SizedBox(height: 12),
          const Text("Exclude tax calculations if applicable.", style: TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildStockSection() {
    return _FormCard(
      title: "Stock Details",
      icon: Icons.inventory_2_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFieldLabel("Initial Stock Level"),
          TextField(
            keyboardType: TextInputType.number,
            decoration: _inputDecoration("0"),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500, color: Color(0xFF1E293B))),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: const Color(0xFFFAFAFA),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
    );
  }
}

// --- Shared Helper Widgets ---
class _FormCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  const _FormCard({required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFFF97316), size: 20),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title, value, subText;
  final Color subColor;
  const _StatCard({required this.title, required this.value, required this.subText, required this.subColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          Text(subText, style: TextStyle(fontSize: 12, color: subColor, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _InventoryRow extends StatelessWidget {
  final String sku, name, category, rate, status;
  final Color statusColor;
  const _InventoryRow({required this.sku, required this.name, required this.category, required this.rate, required this.status, required this.statusColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          SizedBox(width: 100, child: Text(sku, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13))),
          Expanded(flex: 3, child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
          Expanded(flex: 2, child: Text(category, style: const TextStyle(fontSize: 11, color: Colors.blueGrey))),
          SizedBox(width: 120, child: Text(rate, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
          Expanded(
            flex: 2,
            child: Row(
              children: [
                CircleAvatar(radius: 4, backgroundColor: statusColor),
                const SizedBox(width: 8),
                Text(status, style: TextStyle(fontSize: 13, color: statusColor, fontWeight: FontWeight.w500)),
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