// This holds the current search string globally
import 'package:flutter_riverpod/flutter_riverpod.dart';

final estimateSearchProvider = StateProvider<String>((ref) => "");