import 'package:billing_software/screens/estimates/modules/business_model.dart';
import 'package:billing_software/screens/estimates/modules/business_provider.dart';
import 'package:billing_software/screens/estimates/modules/customer_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  runApp(const MaterialApp(
    home: EstimatePreview(estimateId: "EST-2024-0892"),
    debugShowCheckedModeBanner: false,
  ));
}
bool isEditing = false;
class EstimatePreview extends ConsumerStatefulWidget {
  final String estimateId;

  const EstimatePreview({super.key, required this.estimateId});
  @override
  ConsumerState<EstimatePreview> createState() => _EstimatePreviewState();
}
class _EstimatePreviewState extends ConsumerState<EstimatePreview> {
BusinessModel? _currentBusiness;


@override
  void initState() {
    super.initState();
    // 2. Call your fetch method when the screen loads
    _fetchBusinessData();
  }

//============FETCH COMPANY NAME=====================
  Future<void> _fetchBusinessData() async {
  try {
    final response = await Supabase.instance.client
        .from('business')
        .select()
        .maybeSingle(); // Gets one row or null

    if (response != null) {
      setState(() {
        // This populates the variable and triggers a UI refresh
        _currentBusiness = BusinessModel.fromMap(response);
      });
    }
  } catch (e) {
    debugPrint("Error loading business: $e");
  }
}
 @override

 
Widget build(BuildContext context) {
  final businessAsync = ref.watch(businessProvider);
  final estimateAsync = ref.watch(singleEstimateProvider(widget.estimateId));

  return Scaffold(
    backgroundColor: const Color(0xFFF1F5F9),
    body: Column(
      children: [
        // 1. Action Bar stays at the top
        _buildTopActionBar(context),
        
        Expanded(
          child: businessAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Business Error: $err')),
            data: (business) => estimateAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Estimate Error: $err')),
              data: (estimate) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    // 2. Switch between Preview and Edit Form here
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: isEditing 
                        ? _buildEditForm(business, estimate) 
                        : _buildMainDocument(business, estimate),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    ),
  );
}

  // --- Top Action Bar ---
Widget _buildTopActionBar(BuildContext context) {
  final estimateAsync = ref.watch(singleEstimateProvider(widget.estimateId));
  return estimateAsync.when(
    loading: () => const SizedBox.shrink(),
    error: (err, stack) => const Text("Error loading actions"),
    data: (estimate) { // This 'estimate' is the fresh data from your provider
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("ESTIMATE PREVIEW", 
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                Text(estimate['estimate_number'] ?? "#N/A", 
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const Spacer(),
            if (isEditing) ...[
              _buildActionButton(Icons.close, "Cancel", 
                onTap: () => setState(() => isEditing = false)),
              const SizedBox(width: 8),
              _buildActionButton(
                Icons.save, 
                "Save Changes", 
                onTap: () => _saveChanges(estimate), 
              ),
            ] else ...[
              _buildActionButton(Icons.edit, "Edit", 
                onTap: () => setState(() => isEditing = true)),
            ],
            const SizedBox(width: 12),
            
            // PDF BUTTON FIXED HERE
            _buildActionButton(
              Icons.picture_as_pdf_outlined, 
              "Print to PDF",
              // We use 'estimate' from the callback and 'business' from the top
              onTap: () => generatePdf(estimate, _currentBusiness), 
            ),

            const SizedBox(width: 12),
           
          ],
        ),
      );
    },
  );
}
//=================Edit===========================//

Widget _buildEditForm(BusinessModel? business, Map<String, dynamic> estimate) {
  // Extract nested data for easier access
  final customer = estimate['customers'] as Map<String, dynamic>? ?? {};
  final List<dynamic> items = estimate['estimate_items'] as List<dynamic>? ?? [];

  return Column(
    children: [
      Container(
        width: 800,
        padding: const EdgeInsets.all(60),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Editing Estimate: ${estimate['estimate_number']}", 
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const Divider(height: 40),

            // --- SECTION 1: CUSTOMER INFO ---
            const Text("CUSTOMER INFORMATION", style: _sectionHeaderStyle),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildField("Customer Name", customer['name'], (val) => customer['name'] = val)),
                const SizedBox(width: 16),
               
              ],
            ),
            const SizedBox(height: 16),
            _buildField("Billing Address", customer['billing_address'], (val) => customer['billing_address'] = val, maxLines: 2),

            const SizedBox(height: 40),

            // --- SECTION 2: ESTIMATE DETAILS ---
            const Text("ESTIMATE DETAILS", style: _sectionHeaderStyle),
            const SizedBox(height: 16),
            _buildField("Notes", estimate['notes'], (val) => estimate['notes'] = val, maxLines: 3),

            const SizedBox(height: 40),

            // --- SECTION 3: LINE ITEMS ---
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("LINE ITEMS", style: _sectionHeaderStyle),
                TextButton.icon(
                  onPressed: () => setState(() => items.add({'description': '', 'qty': 1, 'rate': 0, 'amount': 0})),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text("Add Item"),
                ),
              ],
            ),
            const Divider(),
            ...items.asMap().entries.map((entry) {
              int index = entry.key;
              var item = entry.value;
              return _buildEditableItemRow(item, onDelete: () => setState(() => items.removeAt(index)));
            }).toList(),
          ],
        ),
      ),
    ],
  );
}

//===========================Save Logic==========================

Future<void> _saveChanges(Map<String, dynamic> estimate) async {
  final supabase = Supabase.instance.client;
  final String uuid = estimate['reference'];
  final cust = estimate['customers'];

  try {
    // 1. Update Customer
    await supabase.from('customers').update({
      'name': cust['name'],
      'email': cust['email'],
      'billing_address': cust['billing_address'],
      'phone': cust['phone'], // Added phone from your schema
    }).eq('reference', estimate['customer_ref']);

    // 2. Update Estimate
    await supabase.from('estimates').update({
      'notes': estimate['notes'],
      'total': estimate['total'], 
      'subtotal': estimate['subtotal'],
    }).eq('reference', uuid);

    // 3. Re-sync Line Items (Delete then Insert)
   // await supabase.from('estimate_items').delete().eq('estimate_ref', uuid);
    
    final List<dynamic> items = estimate['estimate_items'] ?? [];

// 1️⃣ Get existing DB items (using id, not reference)
final existingDbItems = await supabase
    .from('estimate_items')
    .select('id')
    .eq('estimate_ref', uuid);

final existingIds =
    (existingDbItems as List).map((e) => e['id'] as int).toSet();

final currentIds = <int>{};

// 2️⃣ Update or Insert
for (var item in items) {
  if (item['id'] != null) {
    currentIds.add(item['id']);

    // 🔵 UPDATE existing
    await supabase
        .from('estimate_items')
        .update({
          'description': item['description'],
          'qty': item['qty'],
          'rate': item['rate'],
          'amount': (item['qty'] ?? 0) * (item['rate'] ?? 0),
        })
        .eq('id', item['id']);
  } else {
    // 🟢 INSERT new
    final inserted = await supabase
        .from('estimate_items')
        .insert({
          'estimate_ref': uuid,
          'business_ref': estimate['business_ref'],
          'item_ref': item['item_ref'],
          'description': item['description'],
          'qty': item['qty'],
          'rate': item['rate'],
          'amount': (item['qty'] ?? 0) * (item['rate'] ?? 0),
        })
        .select()
        .single();

    currentIds.add(inserted['id']);
  }
}

// 3️⃣ Delete removed items
final idsToDelete = existingIds.difference(currentIds);

print("Delete these IDs: $idsToDelete");

// 4️⃣ Delete removed
if (idsToDelete.isNotEmpty) {
  await supabase
      .from('estimate_items')
      .delete()
      .inFilter('id', idsToDelete.toList());
}
    // 4. Success Feedback & State Cleanup
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Estimate saved successfully")),
    );

    // Refresh the list provider so the dashboard shows new data
    // (Replace 'estimatesProvider' with your actual list provider name)
    ref.invalidate(singleEstimateProvider(uuid)); 

    // 5. NAVIGATE BACK
    context.go('/estimates');

  } catch (e) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
    );
  }
}
  Widget _buildActionButton(IconData icon, String label, {VoidCallback? onTap}) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18, color: Colors.blueGrey),
      label: Text(label, style: const TextStyle(color: Colors.blueGrey)),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  // --- The Centered Document ---
  Widget _buildMainDocument(BusinessModel? business, Map<String, dynamic> estimate) {
    // Extracting nested data for readability
  final customerMap = estimate['customers'] as Map<String, dynamic>? ?? {};
    final itemsList = estimate['estimate_items'] as List<dynamic>? ?? [];

    return Container(
      width: 800, // Fixed width for document look
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            spreadRadius: 5,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Orange Top Border
          Container(
            height: 6, 
            decoration: const BoxDecoration(color: Color(0xFFF97316)),
          ),
          
          Padding(
            padding: const EdgeInsets.all(60.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Pass data to Header
                _buildDocHeader(business, estimate), 
                
                const SizedBox(height: 60),
                
                //2. Pass customer data to Bill To section
               _buildBillToSection(null, customerMap),
                
                const SizedBox(height: 60),
                
                // // 3. Pass items list to Table section
                 _buildLineItemsTable(itemsList),
                
                const SizedBox(height: 40),
                
                // // 4. Pass estimate map to Totals section
                 _buildTotalsSection(estimate),
              ],
            ),
          ),
        ],
      ),
    );
  }

// 1. The Call (Ensure variables match the names defined in your build/data block)


// 2. The Widget Definition
Widget _buildDocHeader(BusinessModel? business, Map<String, dynamic> estimate) {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Left Side: Business Branding
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Dynamic Logo with fallback
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(4),
              ),
              child: (business?.logoUrl != null && business!.logoUrl!.isNotEmpty)
                  ? Image.network(
                      business.logoUrl!,
                      width: 24,
                      height: 24,
                      errorBuilder: (context, error, stackTrace) => 
                          const Icon(Icons.architecture, color: Colors.white, size: 24),
                    )
                  : const Icon(Icons.architecture, color: Colors.white, size: 24),
            ),
            const SizedBox(height: 12),
            
            // Business Name
            Text(
              business?.name ?? "Your Business Name", 
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            
            // Business Info (Address/GST)
            if (business?.info != null && business!.info!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  business.info!,
                  style: const TextStyle(fontSize: 12, color: Colors.grey, height: 1.4),
                ),
              ),
          ],
        ),
      ),
      
      // Right Side: Estimate Details
      Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          const Text(
            "ESTIMATE", 
            style: TextStyle(
              fontSize: 32, 
              letterSpacing: 1.5, 
              color: Color(0xFF94A3B8),
              fontWeight: FontWeight.w300,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "Date: ${estimate['estimate_date'] ?? 'N/A'}", 
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "Estimate #: ${estimate['estimate_number'] ?? 'N/A'}", 
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 4),
          Text(
            "Reference: ${estimate['notes'] ?? 'None'}", 
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
        ],
      )
    ],
  );
}

Widget _buildBillToSection(CustomerModel? customer, Map<String, dynamic> details) {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "BILL TO:", 
            style: TextStyle(
              fontSize: 11, 
              fontWeight: FontWeight.bold, 
              color: Color(0xFFF97316),
            ),
          ),
          const SizedBox(height: 8),
          
          // Customer Name (Bold and Larger)
          Text(
            details['name'] ?? 'N/A', 
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          
          const SizedBox(height: 4),
          
          // Address, Email, and Phone
          Text(
            "${details['billing_address'] ?? 'No Address'}\n"
            "${details['phone'] ?? ''}", 
            style: const TextStyle(
              fontSize: 13, 
              color: Colors.grey, 
              height: 1.5,
            ),
          ),
        ],
      ),
    ],
  );
}
               
Widget _buildLineItemsTable(List<dynamic> items) {
  return Column(
    children: [
      // Table Header
      Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
        ),
        child: const Row(
          children: [
            Expanded(flex: 4, child: Text("ITEM DESCRIPTION", style: _tableHeaderStyle)),
            Expanded(child: Text("QTY", textAlign: TextAlign.center, style: _tableHeaderStyle)),
            Expanded(child: Text("RATE", textAlign: TextAlign.center, style: _tableHeaderStyle)),
            Expanded(child: Text("AMOUNT", textAlign: TextAlign.right, style: _tableHeaderStyle)),
          ],
        ),
      ),
      // Dynamic Rows from Backend
      if (items.isEmpty)
        const Padding(
          padding: EdgeInsets.all(24.0),
          child: Text("No items found for this estimate.", style: TextStyle(color: Colors.grey)),
        )
      else
        ...items.map((item) {
          return _buildItemRow(
           
            item['description'] ?? '',
            "${item['qty'] ?? 0}",
            "\$${item['rate']?.toStringAsFixed(2) ?? '0.00'}",
            "\$${item['amount']?.toStringAsFixed(2) ?? '0.00'}",
          );
        }).toList(),
    ],
  );
}

  Widget _buildItemRow( String desc, String qty, String rate, String amount) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(desc, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
               
              ],
            ),
          ),
          Expanded(child: Text(qty, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14))),
          Expanded(child: Text(rate, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14))),
          Expanded(child: Text(amount, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
        ],
      ),
    );
  }

Widget _buildTotalsSection(Map<String, dynamic> estimate) {
  // Helper to format currency
  String format(dynamic value) => "\$${(value ?? 0).toStringAsFixed(2)}";

  return Align(
    alignment: Alignment.centerRight,
    child: SizedBox(
      width: 250,
      child: Column(
        children: [
          _totalRow("Subtotal", format(estimate['subtotal'])),
          const SizedBox(height: 8),
          if ((estimate['discount'] ?? 0) > 0) ...[
            _totalRow("Discount", "- ${format(estimate['discount'])}"),
            const SizedBox(height: 8),
          ],
          // Calculated Tax (If you don't have a tax column, calculate it here)
          _totalRow("Tax (0%)", format(0)), 
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Total", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(
                format(estimate['total']), 
                style: const TextStyle(
                  fontSize: 18, 
                  fontWeight: FontWeight.bold, 
                  color: Color(0xFFF97316),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

  Widget _totalRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }

  static const _tableHeaderStyle = TextStyle(fontSize: 11, fontWeight: FontWeight.bold);


  // Reusable TextField for the document look
Widget _buildField(String label, dynamic initialValue, Function(String) onChanged, {int maxLines = 1}) {
  return TextFormField(
    initialValue: initialValue?.toString() ?? '',
    maxLines: maxLines,
    decoration: InputDecoration(
      labelText: label,
      border: const OutlineInputBorder(),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
    ),
    onChanged: onChanged,
  );
}

// Editable Row for Line Items (Matches your estimate_items table)
Widget _buildEditableItemRow(Map<String, dynamic> item, {required VoidCallback onDelete}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 8.0),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 4,
          child: _buildField("Description", item['description'], (val) => item['description'] = val),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildField("Qty", item['qty'], (val) => item['qty'] = double.tryParse(val) ?? 0),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildField("Rate", item['rate'], (val) => item['rate'] = double.tryParse(val) ?? 0),
        ),
        IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), onPressed: onDelete),
      ],
    ),
  );
}

static const _sectionHeaderStyle = TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blueGrey);

}