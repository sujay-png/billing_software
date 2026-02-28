class CustomerModel {
  final String reference;
  final String name;
  final String phone;
  final String email;
  final String address;

  CustomerModel({
    required this.reference,
    required this.name,
     required this.phone,
      required this.email, 
      required this.address,
   
  });

  factory CustomerModel.fromMap(Map<String, dynamic> map) {
    return CustomerModel(
      // Maps to 'reference' uuid column
      reference: map['reference'] ?? '', 
      // Maps to 'business_name' text column
      name: map['name'] ?? 'Unnamed Business', 
      // Maps to 'business_phone' text column
      phone: map['phone'] ?? 'Not Provided', 
      // Maps to 'email' text column
      email: map['email'] ?? 'Not Provided',
       // Maps to 'email' text column
      address: map['billing_address'] ?? 'Not Provided',

   
    );
  }

  // Helper method to convert back to a Map for Supabase updates
  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'billing_address': address,
      
    };
  }
}