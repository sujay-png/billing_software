class EstimateItemModel {
  final String description;
  final double qty;
  final double rate;
  final double amount;

  EstimateItemModel({
    required this.description,
    required this.qty,
    required this.rate,
    required this.amount,
  });

  factory EstimateItemModel.fromMap(Map<String, dynamic> map) {
    return EstimateItemModel(
      description: map['description'],
      qty: (map['qty'] as num).toDouble(),
      rate: (map['rate'] as num).toDouble(),
      amount: (map['amount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toMap(String businessRef, String estimateRef) {
    return {
      'business_ref': businessRef,
      'estimate_ref': estimateRef,
      'description': description,
      'qty': qty,
      'rate': rate,
      'amount': amount,
    };
  }
}