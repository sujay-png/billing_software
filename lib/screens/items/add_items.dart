import 'package:billing_software/core/supabase_client.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  runApp(
    const MaterialApp(
      home: ItemsDashboard(),
      debugShowCheckedModeBanner: false,
    ),
  );
}

bool _isSaving = false;

class ItemsDashboard extends StatefulWidget {
  const ItemsDashboard({super.key});

  @override
  State<ItemsDashboard> createState() => _ItemsDashboardState();
}

class _ItemsDashboardState extends State<ItemsDashboard> {
  String _searchQuery = "";
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
           child: TextField(
  onChanged: (value) {
    setState(() {
      _searchQuery = value;
    });
  },
  decoration: const InputDecoration(
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

  Widget _buildSummaryRow() {
  return StreamBuilder<List<Map<String, dynamic>>>(
    stream: Supabase.instance.client
        .from('items')
        .stream(primaryKey: ['id']),
    builder: (context, snapshot) {
      if (!snapshot.hasData) {
        return const SizedBox();
      }

      final items = snapshot.data!;

      final totalItems = items.length;

      final lowStock = items.where((item) {
        final stock = item['stock'] ?? 0;
        return stock > 0 && stock < 10;
      }).length;

      final outOfStock = items.where((item) {
        final stock = item['stock'] ?? 0;
        return stock == 0;
      }).length;

      final totalValuation = items.fold<double>(0.0, (sum, item) {
        final rate = (item['rate'] ?? 0).toDouble();
        final stock = (item['stock'] ?? 0);
        return sum + (rate * stock);
      });

      return Row(
        children: [
          Expanded(
            child: _StatCard(
              title: "TOTAL ITEMS",
              value: totalItems.toString(),
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: _StatCard(
              title: "LOW STOCK",
              value: lowStock.toString(),
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: _StatCard(
              title: "OUT OF STOCK",
              value: outOfStock.toString(),
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: _StatCard(
              title: "TOTAL VALUATION",
              value: "₹${totalValuation.toStringAsFixed(2)}",
            ),
          ),
        ],
      );
    },
  );
}
  Widget _buildInventoryTable() {
    return Container(
      height: 600,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _buildTableHeader(),
          const Divider(height: 1),
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: Supabase.instance.client
                  .from('items')
                  .stream(primaryKey: ['id'])
                  .order('created_at', ascending: false),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(child: Text("Error: ${snapshot.error}"));
                }

                final items = snapshot.data ?? [];
final filteredItems = items.where((item) {
  final name = (item['item_name'] ?? "").toString().toLowerCase();
  final sku = (item['sku'] ?? "").toString().toLowerCase();
  final category = (item['category'] ?? "").toString().toLowerCase();

  return name.contains(_searchQuery.toLowerCase()) ||
      sku.contains(_searchQuery.toLowerCase()) ||
      category.contains(_searchQuery.toLowerCase());
}).toList();
                if (items.isEmpty) {
                  return const Center(child: Text("No items found."));
                }

                return ListView.separated(
                  padding: EdgeInsets.zero,
                  shrinkWrap: false,
                  itemCount: filteredItems.length,
                  separatorBuilder: (context, index) =>
                      const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = filteredItems[index];
                    final int stock = item['stock'] ?? 0;

                    String statusLabel = "Out of Stock ($stock)";
                    Color statusColor = Colors.red;

                    if (stock > 0) {
                      statusLabel = stock < 10
                          ? "Low Stock ($stock)"
                          : "In Stock ($stock)";
                      statusColor = stock < 10 ? Colors.orange : Colors.green;
                    }

                    return _InventoryRow(
                      itemData: item,
                      statusColor: statusColor,
                    );
                  },
                );
              },
            ),
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
          SizedBox(width: 100, child: Text("SKU", style: _headerStyle)),
          Expanded(flex: 3, child: Text("ITEM NAME", style: _headerStyle)),
          Expanded(flex: 2, child: Text("CATEGORY", style: _headerStyle)),
          Expanded(flex: 2, child: Text("DESCRIPTION", style: _headerStyle)),
          SizedBox(width: 120, child: Text("RATE", style: _headerStyle)),
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

// --- Add New Item Screen ---
class AddItemScreen extends StatefulWidget {
  final Map<String, dynamic>? existingItem;
  const AddItemScreen({super.key, this.existingItem});

  @override
  State<AddItemScreen> createState() => _AddItemScreenState();
}

class _AddItemScreenState extends State<AddItemScreen> {
 

  
  String _itemName = '';
  String _sku = '';
  String _category = '';
  String _description = '';

  double _rate = 0.0;
  int _stock = 0;

  @override
  void initState() {
    super.initState();
  
    
    if (widget.existingItem != null) {
      _itemName = widget.existingItem!['item_name'] ?? '';
      _sku = widget.existingItem!['sku'] ?? '';
      _category = widget.existingItem!['category'] ?? '';
      _description = widget.existingItem!['description'] ?? '';
      _rate = (widget.existingItem!['rate'] ?? 0.0).toDouble();
      _stock = widget.existingItem!['stock'] ?? 0;
    }
  }

  //=============Save Logic====================//
 Future<void> _handleSave() async {
  if (_itemName.trim().isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Item name is required")),
    );
    return;
  }

  setState(() => _isSaving = true);

  try {
    if (widget.existingItem != null) {
      await _updateItem();
    } else {
      await _insertItem();
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Item saved successfully!")),
      );
   context.go('/items');
    }
  } catch (e) {
    debugPrint("Save Error: $e");
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  } finally {
    if (mounted) setState(() => _isSaving = false);
  }
}

Future<void> _updateItem() async {
  await Supabase.instance.client
      .from('items')
      .update({
        'item_name': _itemName,
        'sku':_sku,
        'category': _category,
        'description':_description,
        'rate': _rate,  
        'stock': _stock
      })
      .eq('id', widget.existingItem!['id']);
}
Future<void> _insertItem() async {
  final client = Supabase.instance.client;

  final List<dynamic> businesses = await client
      .from('business')
      .select('reference')
      .limit(1);

  if (businesses.isEmpty) {
    throw "No business profile found. Please create one first.";
  }

  final String businessRef = businesses.first['reference'];

  await client.from('items').insert({
    'item_name': _itemName.trim(),
    'sku': _sku.trim().isEmpty ? null : _sku.trim(),
    'category': _category.trim().isEmpty ? null : _category.trim(),
    'description': _description.trim().isEmpty ? null : _description.trim(),
    'rate': _rate,
    'stock': _stock,
    'business_ref': businessRef,
  });
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        leading: IconButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ItemsDashboard()),
            );
          },
          icon: Icon(Icons.arrow_back),
        ),
       title: Text(
  widget.existingItem != null
      ? "Edit Item"
      : "Add New Item",
  style: const TextStyle(
    color: Colors.black,
    fontWeight: FontWeight.bold,
  ),
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
            const Text(
              "Create a new product or service in your inventory database.",
              style: TextStyle(color: Colors.grey),
            ),
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
                  child: const Text(
                    "Cancel",
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                const SizedBox(width: 16),
               ElevatedButton(
  onPressed: _isSaving ? null : _handleSave,
  style: ElevatedButton.styleFrom(
    backgroundColor: const Color(0xFFF97316),
    padding: const EdgeInsets.symmetric(
      horizontal: 32,
      vertical: 16,
    ),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  ),
 child: _isSaving
    ? const SizedBox(
        height: 18,
        width: 18,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: Colors.white,
        ),
      )
    : Text(
        widget.existingItem != null
            ? "Update Item"
            : "Save Item",
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
),
              ],
            ),
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
          TextFormField(
            decoration: _inputDecoration("e.g. Wireless Ergonomic Mouse"),
            initialValue: _itemName,
            onChanged: (val) => _itemName = val,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel("SKU / Item Code"),
                    TextFormField(
                      decoration: _inputDecoration("WEM-001-BL"),
                      initialValue: _sku,
                      onChanged: (val) => _sku = val,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel("Category"),
                    TextFormField(
                      decoration: _inputDecoration("Enter category..."),
                      initialValue: _category,
                      onChanged: (val) => _category = val,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildFieldLabel("Description"),
          TextFormField(
            maxLines: 4,
            decoration: _inputDecoration(
              "Brief details for internal records...",
            ),
            initialValue: _description,
            onChanged: (val) => _description = val,
          ),
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
          TextFormField(
            // Show empty if rate is 0, otherwise show the number
            initialValue: _rate == 0.0 ? "" : _rate.toString(),
            keyboardType: TextInputType.number,
            decoration: _inputDecoration("0.00").copyWith(prefixText: "₹ "),
            onChanged: (val) => _rate = double.tryParse(val) ?? 0.0,
          ),
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
          TextFormField(
            initialValue: _stock == 0 ? "" : _stock.toString(),
            keyboardType: TextInputType.number,
            decoration: _inputDecoration("0"),
            onChanged: (val) => _stock = int.tryParse(val) ?? 0,
          ),
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        label,
        style: const TextStyle(
          fontWeight: FontWeight.w500,
          color: Color(0xFF1E293B),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: const Color(0xFFFAFAFA),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade200),
      ),
    );
  }
}

// --- Shared Helper Widgets ---
class _FormCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  const _FormCard({
    required this.title,
    required this.icon,
    required this.child,
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
          Row(
            children: [
              Icon(icon, color: const Color(0xFFF97316), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
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
  final String title, value;

  const _StatCard({required this.title, required this.value});

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
          // const SizedBox(height: 8),
          // Text(subText!, style: TextStyle(fontSize: 12, color: subColor, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  // 1. The Stream that listens to your 'items' table
  final Stream<List<Map<String, dynamic>>> _itemsStream = Supabase
      .instance
      .client
      .from('items')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text("Inventory")),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _itemsStream,
        builder: (context, snapshot) {
          // Handle Loading State
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          // Handle Error State
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          // Handle Empty State
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return const Center(child: Text("No items found. Tap '+' to add."));
          }

          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (context, index) =>
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
            itemBuilder: (context, index) {
              final item = items[index];

              // Calculate Status Logic
              final int stock = item['stock'] ?? 0;
              final bool isLowStock = stock > 0 && stock < 10;

              String statusText = "Out of Stock";
              Color statusColor = Colors.red;

              if (stock > 0) {
                statusText = isLowStock ? "Low Stock" : "In Stock";
                statusColor = isLowStock ? Colors.orange : Colors.green;
              }

              return _InventoryRow(itemData: item, statusColor: statusColor);
            },
          );
        },
      ),
    );
  }
}

class _InventoryRow extends StatefulWidget {
  final Map<String, dynamic> itemData;

  final Color statusColor;

  const _InventoryRow({required this.itemData, required this.statusColor});

  @override
  State<_InventoryRow> createState() => _InventoryRowState();
}

class _InventoryRowState extends State<_InventoryRow> {
  @override
  Widget build(BuildContext context) {
    final int stock = widget.itemData['stock'] ?? 0;
    final String statusText = stock <= 0
        ? "Out of Stock"
        : stock < 10
        ? "Low Stock"
        : "In Stock";

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              widget.itemData['sku'] ?? 'N/A',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
            ),
          ),

          Expanded(
            flex: 3,
            child: Text(
              widget.itemData['item_name'] ?? 'Untitled',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
          ),

          Expanded(
            flex: 2,
            child: Text(
              widget.itemData['category'] ?? 'NA',
              style: const TextStyle(fontSize: 11, color: Colors.blueGrey),
            ),
          ),

          Expanded(
            flex: 2,
            child: Text(
              widget.itemData['description'] ?? 'NA',
              style: const TextStyle(fontSize: 11, color: Colors.blueGrey),
            ),
          ),

          SizedBox(
            width: 120,
            child: Text(
              "₹${widget.itemData['rate'] ?? 0}",
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
                CircleAvatar(radius: 4, backgroundColor: widget.statusColor),
                const SizedBox(width: 8),
                Text(
                  "$stock $statusText",
                  style: TextStyle(
                    fontSize: 13,
                    color: widget.statusColor,
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
              children: [
                // EDIT
                GestureDetector(
               onTap: () async {
  final didUpdate = await Navigator.of(context).push(
    MaterialPageRoute(
      builder: (_) => AddItemScreen(existingItem: widget.itemData),
    ),
  );
  
  if (didUpdate == true) {
    // Rebuild parent to refresh StreamBuilder
    if (context.mounted) setState(() {});
  }
  
},
                  child: const Icon(
                    Icons.edit_outlined,
                    size: 18,
                    color: Colors.blueGrey,
                  ),
                ),

                const SizedBox(width: 12),

                // DELETE
                GestureDetector(
                  onTap: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text("Delete Item"),
                        content: Text(
                          "Are you sure you want to delete '${widget.itemData['item_name']}'?",
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text("Cancel"),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: const Text(
                              "Delete",
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                    );

                    if (confirm == true) {
                      await Supabase.instance.client
                          .from('items')
                          .delete()
                          .eq('id', widget.itemData['id']);
                    }
                  },
                  child: const Icon(
                    Icons.delete_outline,
                    size: 18,
                    color: Colors.redAccent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
