import 'package:billing_software/screens/items/modules/item_model.dart';
import 'package:billing_software/screens/items/modules/item_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


final itemsListProvider =
    FutureProvider<List<ItemModel>>((ref) async {
  final repo = ref.read(ItemRepository as ProviderListenable<dynamic>);
  return repo.fetchItems();
});