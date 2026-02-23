import 'package:billing_software/screens/estimates/modules/estimate_item_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_model.dart';

import '../../../core/supabase_client.dart';


class EstimateRepository {

  Future<List<EstimateModel>> fetchEstimates() async {
    final response = await supabase
        .from('estimates')
        .select()
        .order('created_at', ascending: false);

    return (response as List)
        .map((e) => EstimateModel.fromMap(e))
        .toList();
  }

  Future<void> createEstimate({
    required EstimateModel estimate,
    required List<EstimateItemModel> items,
    required String businessRef,
  }) async {

    final inserted = await supabase
        .from('estimates')
        .insert({
          'business_ref': businessRef,
          'estimate_number': estimate.estimateNumber,
          'customer_ref': estimate.customerRef,
          'subtotal': estimate.subtotal,
          'discount': estimate.discount,
          'total': estimate.total,
          'status': estimate.status,
        })
        .select()
        .single();

    final estimateRef = inserted['reference'];

    for (final item in items) {
      await supabase
          .from('estimate_items')
          .insert(item.toMap(businessRef, estimateRef));
    }
  }

  Future<Map<String, dynamic>> fetchEstimateWithItems(String reference) async {
    final data = await supabase
        .from('estimates')
        .select('*, estimate_items(*)')
        .eq('reference', reference)
        .single();

    return data;
  }

  Future<void> deleteEstimate(String reference) async {
    await supabase
        .from('estimates')
        .delete()
        .eq('reference', reference);
  }
}