class BusinessModel {
  final String reference;
  final String name;
  final String? phone;
  final String? gst;
  final String? info; 
  final String? logoUrl;

  BusinessModel({
    required this.reference,
    required this.name,
    this.phone,
    this.gst,
    this.info,
    this.logoUrl,
  });

  factory BusinessModel.fromMap(Map<String, dynamic> map) {
    return BusinessModel(
      // Maps to 'reference' uuid column
      reference: map['reference'] ?? '', 
      // Maps to 'business_name' text column
      name: map['business_name'] ?? 'Unnamed Business', 
      // Maps to 'business_phone' text column
      phone: map['business_phone'],
      // Maps to 'business_gst' text column
      gst: map['business_gst'],
      // Maps to 'business_info' text column (your address field)
      info: map['business_info'],
      // Maps to 'business_logo' text column
      logoUrl: map['business_logo'],
    );
  }

  // Helper method to convert back to a Map for Supabase updates
  Map<String, dynamic> toMap() {
    return {
      'business_name': name,
      'business_phone': phone,
      'business_gst': gst,
      'business_info': info,
      'business_logo': logoUrl,
    };
  }
}