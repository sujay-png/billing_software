import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:billing_software/screens/estimates/modules/estimate_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';


class CreateEstimate extends ConsumerStatefulWidget {
  const CreateEstimate({super.key});

  @override
  ConsumerState<CreateEstimate> createState() => _CreateEstimateState();
}

class _CreateEstimateState extends ConsumerState<CreateEstimate> {
  // Fixed widths for pixel-perfect table alignment
  static const double _qtyWidth = 100.0;
  static const double _rateWidth = 140.0;
  static const double _amountWidth = 110.0;
  static const double _actionWidth = 48.0;
  static const double _dragWidth = 32.0;

  // Controllers for Header & Customer Info
  final _customerNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  final _termsController = TextEditingController();
  final _estimateNumberController = TextEditingController(text: "EST-2024-002");
  final _referenceController = TextEditingController();

  final List<LineItem> _items = [
    LineItem(description: "UI/UX Design - Dashboard Mobile App", qty: 40, rate: 85),
    LineItem(description: "Backend API Integration", qty: 20, rate: 120),
  ];

  double _totalDiscount = 0.0;
  bool _isSaving = false; // To handle loading state

  double get _subtotal => _items.fold(0, (sum, item) => sum + item.total);
  double get _totalAmount => _subtotal - _totalDiscount;

  void _addNewItem() {
    setState(() {
      _items.add(LineItem(description: "", qty: 1, rate: 0));
    });
  }

  // --- FIXED SAVE LOGIC ---
 Future<void> _handleSave() async {
  if (_customerNameController.text.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Please enter a customer name")),
    );
    return;
  }

  setState(() => _isSaving = true);
  final supabase = Supabase.instance.client;

  try {
    // 1. Fetch Business Reference (UUID)
   final businessData = await supabase
    .from('business')
    .select('reference')
    .limit(1)
    .maybeSingle();

if (businessData == null) throw Exception("Please set up your Business Profile first.");
final String businessRef = businessData['reference'];

// 2. Fetch or Create Customer Reference (UUID)
final existingCustomer = await supabase
    .from('customers')
    .select('reference')
    .eq('name', _customerNameController.text.trim())
    .maybeSingle();

String customerRef;

if (existingCustomer != null) {
  customerRef = existingCustomer['reference'];
} else {
  // AUTO-CREATE CUSTOMER if they don't exist
  final newCustomer = await supabase
      .from('customers')
      .insert({
        'name': _customerNameController.text.trim(),
        'business_ref': businessRef,
        'phone': _phoneController.text,
        'billing_address': _addressController.text,
      })
      .select('reference')  
      .single();
  customerRef = newCustomer['reference'];
}

    // 3. Prepare Line Items
    final lineItems = _items.map((item) => {
      'description': item.description,
      'qty': item.qty,
      'rate': item.rate,
      'amount': item.total,
    }).toList();

    // 4. Create Model
    final estimate = EstimateModel(
      reference: _referenceController.text.isEmpty ? null : _referenceController.text,
      estimateNumber: _estimateNumberController.text,
      customerName: _customerNameController.text,
      customerPhone: _phoneController.text,
      billingAddress: _addressController.text,
      estimateDate: DateTime.now(),
      expiryDate: DateTime.now().add(const Duration(days: 30)),
      subtotal: _subtotal,
      discount: _totalDiscount,
      total: _totalAmount,
      status: "Draft",
      notes: _notesController.text,
      terms: _termsController.text,
    );

    // 5. Save via Provider
    await ref.read(estimateProvider.notifier).createEstimate(
      estimate: estimate,
      items: lineItems,
      businessRef: businessRef,
      customerRef: customerRef,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Estimate saved successfully!"), backgroundColor: Colors.green),
      );
    }
  } catch (e) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  } finally {
    if (mounted) setState(() => _isSaving = false);
  }
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
              onPressed: _isSaving ? null : _handleSave, // Disable while saving
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF97316),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isSaving 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text("Save Estimate", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        )
      ],
    );
  }

  // --- Keep your existing UI Widget builders below (_buildCustomerInfo, _buildLogistics, etc.) ---
  // Ensure that in _buildCustomerInfo, you use _customerNameController, etc.
  
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
                    TextField(controller: _customerNameController, decoration: _inputDecoration("e.g. John Doe")),
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
                    TextField(controller: _phoneController, decoration: _inputDecoration("e.g. +1 234 567 8901")),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text("Billing Address", style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: Color(0xFF64748B))),
          const SizedBox(height: 8),
          TextField(controller: _addressController, maxLines: 3, decoration: _inputDecoration("Enter full street address...")),
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
          _buildLogisticsField("ESTIMATE NUMBER", _estimateNumberController),
          _buildLogisticsField("ESTIMATE DATE", TextEditingController(text: "20/05/2024"), icon: Icons.calendar_today),
          _buildLogisticsField("EXPIRY DATE", TextEditingController(text: "20/06/2024"), icon: Icons.calendar_today),
          _buildLogisticsField("REFERENCE #", _referenceController),
        ],
      ),
    );
  }

  Widget _buildLineItemsSection() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(padding: EdgeInsets.all(20), child: Text("Line Items", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
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
              icon: const Icon(Icons.add_circle_outline, color: Colors.orange),
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
      child: Row(
        children: const [
          SizedBox(width: _dragWidth),
          Expanded(child: Text("DESCRIPTION", style: _headerStyle)),
          SizedBox(width: _qtyWidth, child: Text("QTY", textAlign: TextAlign.center, style: _headerStyle)),
          SizedBox(width: _rateWidth, child: Text("RATE", textAlign: TextAlign.center, style: _headerStyle)),
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
          const SizedBox(width: _dragWidth, child: Icon(Icons.drag_indicator, color: Colors.grey)),
          Expanded(
            child: TextField(
              onChanged: (val) => item.description = val,
              controller: TextEditingController(text: item.description)..selection = TextSelection.collapsed(offset: item.description.length),
              decoration: const InputDecoration(border: InputBorder.none, hintText: "Description"),
            ),
          ),
          SizedBox(
            width: _qtyWidth,
            child: TextField(
              textAlign: TextAlign.center,
              onChanged: (val) => setState(() => item.qty = double.tryParse(val) ?? 0),
              decoration: _inputDecoration("0"),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: _rateWidth,
            child: TextField(
              textAlign: TextAlign.center,
              onChanged: (val) => setState(() => item.rate = double.tryParse(val) ?? 0),
              decoration: _inputDecoration("0.00").copyWith(prefixText: "\$ "),
            ),
          ),
          SizedBox(width: _amountWidth, child: Text("\$${item.total.toStringAsFixed(2)}", textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold))),
          SizedBox(width: _actionWidth, child: IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => setState(() => _items.removeAt(index)))),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        children: [
          _summaryRow("Subtotal", "\$${_subtotal.toStringAsFixed(2)}"),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Discount", style: TextStyle(color: Colors.green)),
              SizedBox(width: 80, child: TextField(onChanged: (val) => setState(() => _totalDiscount = double.tryParse(val) ?? 0), decoration: _inputDecoration("0"))),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Total", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text("\$${_totalAmount.toStringAsFixed(2)}", style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotesAndTerms() {
    return Column(
      children: [
        _SectionCard(title: "Notes", child: TextField(controller: _notesController, maxLines: 2, decoration: _inputDecoration("Notes..."))),
        const SizedBox(height: 16),
        _SectionCard(title: "Terms", child: TextField(controller: _termsController, maxLines: 2, decoration: _inputDecoration("Terms..."))),
      ],
    );
  }

  Widget _buildLogisticsField(String label, TextEditingController controller, {IconData? icon}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 4),
          TextField(controller: controller, decoration: _inputDecoration("").copyWith(suffixIcon: icon != null ? Icon(icon, size: 16) : null)),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label), Text(value, style: const TextStyle(fontWeight: FontWeight.bold))]);
  }

  static const _headerStyle = TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey);

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: const Color(0xFFFAFAFA),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
    );
  }
}

// Support Classes
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
  final IconData? icon;
  const _SectionCard({required this.title, required this.child, this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [if (icon != null) Icon(icon, color: Colors.orange, size: 18), const SizedBox(width: 8), Text(title, style: const TextStyle(fontWeight: FontWeight.bold))]),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}