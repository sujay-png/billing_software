class EstimateModel {
  final String reference;
  final String estimateNumber;
  final String customerRef;
  final double subtotal;
  final double discount;
  final double total;
  final String status;

  EstimateModel({
    required this.reference,
    required this.estimateNumber,
    required this.customerRef,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.status,
  });

  factory EstimateModel.fromMap(Map<String, dynamic> map) {
    return EstimateModel(
      reference: map['reference'],
      estimateNumber: map['estimate_number'],
      customerRef: map['customer_ref'],
      subtotal: (map['subtotal'] as num).toDouble(),
      discount: (map['discount'] as num).toDouble(),
      total: (map['total'] as num).toDouble(),
      status: map['status'],
    );
  }
}