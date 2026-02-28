import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final estimatesListProvider = StreamProvider<List<Map<String, dynamic>>>((ref) {
  final supabase = Supabase.instance.client;

  return supabase
    .from('estimate_summary')
    .stream(primaryKey: ['id']) 
    .map((data) => data.toList());
});