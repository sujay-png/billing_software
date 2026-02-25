import 'package:billing_software/screens/items/modules/item_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


final itemRepositoryProvider = Provider<ItemRepository>((ref) {
  return ItemRepository();
});