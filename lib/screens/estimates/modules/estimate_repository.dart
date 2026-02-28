import 'package:billing_software/screens/estimates/modules/estimate_model.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/supabase_client.dart';

// estimate_repository.dart

class EstimateRepository {
  Future<void> createEstimate({
    required EstimateModel estimate,
    required List<Map<String, dynamic>> items,
    required String businessRef,
    required String customerRef, // Add this
  }) async {
    // 1. Insert Estimate
    final insertedEstimate = await supabase
        .from('estimates')
        .insert(estimate.toMap(businessRef, customerRef)) // Pass both
        .select()
        .single();

    final String estimateRef = insertedEstimate['reference'];

    // 2. Batch Insert Items
    final itemsToInsert = items.map((item) => {
      'business_ref': businessRef,
      'estimate_ref': estimateRef,
      'description': item['description'],
      'qty': item['qty'],
      'rate': item['rate'],
      'amount': item['amount'],
    }).toList();

    await supabase.from('estimate_items').insert(itemsToInsert);
  }
  final _supabase = Supabase.instance.client;

  // This matches the call in the Notifier
  Future<void> deleteEstimate(String reference) async {
    await _supabase
        .from('estimates')
        .delete()
        .eq('reference', reference);
  }
}