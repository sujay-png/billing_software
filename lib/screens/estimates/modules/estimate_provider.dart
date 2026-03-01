import 'package:billing_software/screens/estimates/modules/estimate_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:billing_software/screens/estimates/modules/business_model.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

final estimateRepositoryProvider = Provider<EstimateRepository>((ref) {
  return EstimateRepository();
});

class EstimateNotifier extends AsyncNotifier<void> {
  late final EstimateRepository _repository;

  @override
  Future<void> build() async {
    _repository = ref.read(estimateRepositoryProvider);
  }

  Future<void> createEstimate({
    required EstimateModel estimate,
    required List<Map<String, dynamic>> items,
    required String businessRef,
    required String customerRef,
  }) async {
    state = const AsyncLoading();

    final result = await AsyncValue.guard(() async {
      await _repository.createEstimate(
        estimate: estimate,
        items: items,
        businessRef: businessRef,
        customerRef: customerRef,
      );
    });

    state = result;

    if (result.hasError) {
      throw result.error!; 
    }
  }

  Future<void> deleteEstimate(String reference) async {
  state = const AsyncLoading();

  state = await AsyncValue.guard(() async {
    await _repository.deleteEstimate(reference);
    
    // 🔥 Trigger a refresh of the current provider's data 
    // after a successful deletion.
    ref.invalidateSelf(); 
  });
}
}


//=====================GENERATE PDF===================





Future<void> generatePdf(Map<String, dynamic> estimate, BusinessModel? business) async {
  final pdf = pw.Document();

  pdf.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      build: (pw.Context context) {
        return pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            // Header: Business Name & Estimate Number
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  business?.name ?? "Business Name", 
                  style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)
                ),
               
                pw.Text(
                  "ESTIMATE: ${estimate['estimate_number'] ?? 'N/A'}", 
                  style: pw.TextStyle(fontSize: 14)
                ),
              ],
            ),
              pw.Text(
                  business?.info ?? "ADDRESS", 
                  style: pw.TextStyle(fontSize: 14,)
                ),
            pw.SizedBox(height: 20),
           
            // Customer Info
            pw.Text("BILL TO:", style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Text(estimate['customers']?['name'] ?? "No Customer Name"),
            pw.Text(estimate['customers']?['billing_address'] ?? "No Address Provided"),
            pw.SizedBox(height: 30),

            // Table of Items
            pw.TableHelper.fromTextArray(
              headers: ['Description', 'Qty', 'Rate', 'Amount'],
              data: List<List<dynamic>>.from(
                (estimate['estimate_items'] as List? ?? []).map(
                  (item) => [
                    item['description'] ?? "No Description",
                    item['qty']?.toString() ?? "0",
                    "\$${item['rate'] ?? '0.00'}",
                    "\$${item['amount'] ?? '0.00'}"
                  ],
                ),
              ),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey300),
              cellAlignment: pw.Alignment.centerLeft,
            ),
            
            pw.SizedBox(height: 20),
            pw.Align(
              alignment: pw.Alignment.centerRight,
              child: pw.Text(
                "Total: \$${estimate['total'] ?? '0.00'}", 
                style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)
              ),
            ),
          ],
        );
      },
    ),
  );

  // 1. Convert the document to bytes
  final bytes = await pdf.save();

  // 2. Trigger the Download/Share behavior
  // This will trigger a browser download on Web and a 'Save to Files' on Mobile.
  await Printing.sharePdf(
    bytes: bytes, 
    filename: 'Estimate_${estimate['estimate_number'] ?? 'Draft'}.pdf',
  );
}

//=======FETCH  BUSINESS DATA===========//

// Fetch a single estimate with customer details
final singleEstimateProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final supabase = Supabase.instance.client;

  final response = await supabase
      .from('estimates')
      .select('''
  *,
  customers(*),
  business(*),
  estimate_items(
    *,
    items(*)
  )
''')
      // Ensure 'id' here is the actual UUID (e.g. from your routing)
      // If you MUST query by Estimate Number, change the column name below to 'estimate_number'
      .eq('reference', id) 
      .single();

  return response;
});
// THIS IS THE PART YOU WERE MISSING:
final estimateProvider = AsyncNotifierProvider<EstimateNotifier, void>(EstimateNotifier.new);