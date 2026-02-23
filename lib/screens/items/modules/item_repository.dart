import 'package:billing_software/screens/items/modules/item_model.dart';

import '../../../core/supabase_client.dart';


class ItemRepository {

  Future<List<ItemModel>> fetchItems() async {
    final response = await supabase
        .from('items')
        .select()
        .order('created_at', ascending: false);

    return (response as List)
        .map((item) => ItemModel.fromMap(item))
        .toList();
  }

  Future<void> createItem(ItemModel item, String businessRef) async {
    await supabase.from('items').insert(item.toMap(businessRef));
  }

  Future<void> updateItem(ItemModel item) async {
    await supabase
        .from('items')
        .update({
          'item_name': item.name,
          'sku': item.sku,
          'category': item.category,
          'rate': item.rate,
          'stock': item.stock,
        })
        .eq('reference', item.reference);
  }

  Future<void> deleteItem(String reference) async {
    await supabase
        .from('items')
        .delete()
        .eq('reference', reference);
  }
}