class EstimateModel {
  final String? reference; 
  final String estimateNumber;
  final String customerName;
  final String? customerPhone;
  final String? billingAddress;
  final DateTime estimateDate;
  final DateTime expiryDate;
  final double subtotal;
  final double discount;
  final double total;
  final String status;
  final String? notes;
  final String? terms;

  EstimateModel({
    this.reference, 
    required this.estimateNumber,
    required this.customerName,
    this.customerPhone,
    this.billingAddress,
    required this.estimateDate,
    required this.expiryDate,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.status,
    this.notes,
    this.terms,
  });

  Map<String, dynamic> toMap(String businessRef, String customerRef) { 
    final map = {
      'business_ref': businessRef,    
      'customer_ref': customerRef,    
      'estimate_number': estimateNumber,
      'estimate_date': estimateDate.toIso8601String(),
      'expiry_date': expiryDate.toIso8601String(),
      'subtotal': subtotal,
      'discount': discount,
      'total': total,
      'status': status.toLowerCase(), 
      'notes': notes,
      'terms': terms,
    };

    // Only add reference if it was manually provided
    if (reference != null && reference!.isNotEmpty) {
      map['reference'] = reference;
    }

    return map;
  }
}