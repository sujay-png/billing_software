import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final estimatesListProvider = StreamProvider<List<Map<String, dynamic>>>((ref) {
  final supabase = Supabase.instance.client;

  return supabase
    .from('estimate_summary')
    .stream(primaryKey: ['id']) 
    .order('created_at', ascending: false)
    .map((data) => data.toList());
});