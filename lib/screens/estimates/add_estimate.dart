import 'package:flutter/material.dart';

void main() {
  runApp(const MaterialApp(
    home: CreateEstimate(),
    debugShowCheckedModeBanner: false,
  ));
}

class CreateEstimate extends StatefulWidget {
  const CreateEstimate({super.key});

  @override
  State<CreateEstimate> createState() => _CreateEstimateState();
}

class _CreateEstimateState extends State<CreateEstimate> {
  // Fixed widths for pixel-perfect table alignment
  static const double _qtyWidth = 100.0;
  static const double _rateWidth = 140.0;
  static const double _amountWidth = 110.0;
  static const double _actionWidth = 48.0;
  static const double _dragWidth = 32.0;

  final List<LineItem> _items = [
    LineItem(description: "UI/UX Design - Dashboard Mobile App", qty: 40, rate: 85),
    LineItem(description: "Backend API Integration", qty: 20, rate: 120),
  ];

  double _totalDiscount = 0.0;

  double get _subtotal => _items.fold(0, (sum, item) => sum + item.total);
  double get _totalAmount => _subtotal - _totalDiscount;

  void _addNewItem() {
    setState(() {
      _items.add(LineItem(description: "", qty: 1, rate: 0));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: Row(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                children: [
                  _buildTopHeader(),
                  const SizedBox(height: 32),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: _buildCustomerInfo()),
                      const SizedBox(width: 24),
                      Expanded(flex: 1, child: _buildLogistics()),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildLineItemsSection(),
                  const SizedBox(height: 24),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: _buildNotesAndTerms()),
                      const SizedBox(width: 24),
                      Expanded(flex: 1, child: _buildSummary()),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text("Estimates  /  New Estimate", style: TextStyle(fontSize: 13, color: Colors.grey)),
            SizedBox(height: 8),
            Text("Create New Estimate", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          ],
        ),
        Row(
          children: [
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.remove_red_eye_outlined, size: 18, color: Colors.blueGrey),
              label: const Text("Preview", style: TextStyle(color: Colors.blueGrey)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF97316),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text("Save Estimate", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildCustomerInfo() {
    return _SectionCard(
      title: "Customer Information",
      icon: Icons.person_add_alt_1_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Customer Name", style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: Color(0xFF64748B))),
                    const SizedBox(height: 8),
                    TextField(decoration: _inputDecoration("e.g. John Doe")),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Phone Number", style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: Color(0xFF64748B))),
                    const SizedBox(height: 8),
                    TextField(decoration: _inputDecoration("e.g. +1 234 567 8901")),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text("Billing Address", style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: Color(0xFF64748B))),
          const SizedBox(height: 8),
          TextField(
            maxLines: 3,
            decoration: _inputDecoration("Enter full street address, city, and zip code..."),
          ),
        ],
      ),
    );
  }

  Widget _buildLogistics() {
    return _SectionCard(
      title: "Logistics",
      icon: Icons.local_shipping_outlined,
      child: Column(
        children: [
          _buildLogisticsField("ESTIMATE NUMBER", "EST-2024-002"),
          _buildLogisticsField("ESTIMATE DATE", "20/05/2024", icon: Icons.calendar_today),
          _buildLogisticsField("EXPIRY DATE", "20/06/2024", icon: Icons.calendar_today),
          _buildLogisticsField("REFERENCE #", "PO Number etc."),
        ],
      ),
    );
  }

  Widget _buildLineItemsSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Line Items", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text("Drag rows to reorder", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              ],
            ),
          ),
          const Divider(height: 1),
          _buildTableHeader(),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _items.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) => _buildItemRow(index),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextButton.icon(
              onPressed: _addNewItem,
              icon: const Icon(Icons.add_circle_outline, color: Colors.orange, size: 20),
              label: const Text("Add New Line Item", style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      color: const Color(0xFFFBFBFB),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: const Row(
        children: [
          SizedBox(width: _dragWidth),
          Expanded(child: Text("DESCRIPTION", style: _headerStyle)),
          SizedBox(width: 16),
          SizedBox(width: _qtyWidth, child: Text("QTY", textAlign: TextAlign.center, style: _headerStyle)),
          SizedBox(width: 16),
          SizedBox(width: _rateWidth, child: Text("RATE", textAlign: TextAlign.center, style: _headerStyle)),
          SizedBox(width: 16),
          SizedBox(width: _amountWidth, child: Text("AMOUNT", textAlign: TextAlign.right, style: _headerStyle)),
          SizedBox(width: _actionWidth),
        ],
      ),
    );
  }

  Widget _buildItemRow(int index) {
    final item = _items[index];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          const SizedBox(width: _dragWidth, child: Icon(Icons.drag_indicator, color: Colors.grey, size: 20)),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  onChanged: (val) => item.description = val,
                  controller: TextEditingController(text: item.description)..selection = TextSelection.collapsed(offset: item.description.length),
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
                  decoration: const InputDecoration(border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.zero, hintText: "Description"),
                ),
                const SizedBox(height: 4),
                const Text("Add additional details...", style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: _qtyWidth,
            child: TextField(
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              decoration: _inputDecoration("0"),
              onChanged: (val) => setState(() => item.qty = double.tryParse(val) ?? 0),
              controller: TextEditingController(text: item.qty == 0 ? "" : item.qty.toInt().toString())..selection = TextSelection.collapsed(offset: item.qty.toInt().toString().length),
            ),
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: _rateWidth,
            child: TextField(
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              decoration: _inputDecoration("0.00").copyWith(prefixText: "\$ "),
              onChanged: (val) => setState(() => item.rate = double.tryParse(val) ?? 0),
              controller: TextEditingController(text: item.rate == 0 ? "" : item.rate.toStringAsFixed(2))..selection = TextSelection.collapsed(offset: item.rate.toStringAsFixed(2).length),
            ),
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: _amountWidth,
            child: Text("\$${item.total.toStringAsFixed(2)}", textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          ),
          SizedBox(
            width: _actionWidth,
            child: IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 22),
              onPressed: () => setState(() => _items.removeAt(index)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _summaryRow("Subtotal", "\$${_subtotal.toStringAsFixed(2)}"),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Total Discounts", style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
              SizedBox(
                width: 100,
                height: 35,
                child: TextField(
                  textAlign: TextAlign.right,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14),
                  decoration: _inputDecoration("0.00").copyWith(contentPadding: const EdgeInsets.symmetric(horizontal: 8)),
                  onChanged: (val) => setState(() => _totalDiscount = double.tryParse(val) ?? 0),
                ),
              ),
            ],
          ),
          const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider()),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Total Amount", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Text("\$${_totalAmount.toStringAsFixed(2)}", style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFFD35400))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogisticsField(String label, String value, {IconData? icon}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
          const SizedBox(height: 8),
          TextField(decoration: _inputDecoration(value).copyWith(suffixIcon: icon != null ? Icon(icon, size: 18, color: Colors.grey) : null)),
        ],
      ),
    );
  }

  Widget _buildNotesAndTerms() {
    return Column(
      children: [
        _SectionCard(title: "Notes to Customer", child: TextField(maxLines: 2, decoration: _inputDecoration("Thank you for your business!"))),
        const SizedBox(height: 20),
        _SectionCard(title: "Terms & Conditions", child: TextField(maxLines: 2, decoration: _inputDecoration("Payment is due within 30 days..."))),
      ],
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
      ],
    );
  }

  static const _headerStyle = TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5);

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
      filled: true,
      fillColor: const Color(0xFFFAFAFA),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.orange, width: 1)),
    );
  }
}

class LineItem {
  String description;
  double qty;
  double rate;
  LineItem({required this.description, required this.qty, required this.rate});
  double get total => qty * rate;
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;
  final IconData? icon;
  const _SectionCard({required this.title, required this.child, this.trailing, this.icon});

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
              if (icon != null) Icon(icon, color: const Color(0xFFF97316), size: 20),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              const Spacer(),
              ?trailing,
            ],
          ),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }
}

