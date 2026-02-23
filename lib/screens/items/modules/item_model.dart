class ItemModel {
  final String reference;
  final String name;
  final String? sku;
  final String? category;
  final double rate;
  final int stock;

  ItemModel({
    required this.reference,
    required this.name,
    this.sku,
    this.category,
    required this.rate,
    required this.stock,
  });

  factory ItemModel.fromMap(Map<String, dynamic> map) {
    return ItemModel(
      reference: map['reference'],
      name: map['item_name'],
      sku: map['sku'],
      category: map['category'],
      rate: (map['rate'] as num).toDouble(),
      stock: map['stock'] ?? 0,
    );
  }

  Map<String, dynamic> toMap(String businessRef) {
    return {
      'business_ref': businessRef,
      'item_name': name,
      'sku': sku,
      'category': category,
      'rate': rate,
      'stock': stock,
    };
  }
}