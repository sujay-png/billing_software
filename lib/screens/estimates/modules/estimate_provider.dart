import 'package:billing_software/screens/estimates/modules/estimate_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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

    // Use guard to catch errors and update state automatically
    state = await AsyncValue.guard(() async {
      await _repository.deleteEstimate(reference);
    });
  }
}


//=======FETCH  BUSINESS DATA===========//

// Fetch a single estimate with customer details
final singleEstimateProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final supabase = Supabase.instance.client;

  final response = await supabase
      .from('estimates')
      .select('''
        *,
        customers!estimates_customer_fk (*),
        estimate_items (*)
      ''')
      // Ensure 'id' here is the actual UUID (e.g. from your routing)
      // If you MUST query by Estimate Number, change the column name below to 'estimate_number'
      .eq('reference', id) 
      .single();

  return response;
});
// THIS IS THE PART YOU WERE MISSING:
final estimateProvider = AsyncNotifierProvider<EstimateNotifier, void>(EstimateNotifier.new);