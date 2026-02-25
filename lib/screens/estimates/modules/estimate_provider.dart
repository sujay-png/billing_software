import 'package:billing_software/screens/estimates/modules/estimate_model.dart';
import 'package:billing_software/screens/estimates/modules/estimate_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
}

// THIS IS THE PART YOU WERE MISSING:
final estimateProvider = AsyncNotifierProvider<EstimateNotifier, void>(EstimateNotifier.new);