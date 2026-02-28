import 'package:billing_software/screens/estimates/modules/business_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Provider to fetch business data
final businessProvider = FutureProvider<BusinessModel?>((ref) async {
  final supabase = Supabase.instance.client;

  // We fetch the first record since there is typically only one business
  final response = await supabase
      .from('business')
      .select()
      .limit(1)
      .maybeSingle();

  if (response == null) return null;

  return BusinessModel.fromMap(response);
});