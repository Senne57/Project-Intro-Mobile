class DeviceModel {
  final String id;
  final String ownerId;
  final String ownerName;
  final String title;
  final String description;
  final String category;
  final String? photoUrl;
  final double pricePerDay;
  final bool isAvailable;
  final double latitude;
  final double longitude;
  final String city;

  DeviceModel({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    required this.title,
    required this.description,
    required this.category,
    this.photoUrl,
    required this.pricePerDay,
    this.isAvailable = true,
    required this.latitude,
    required this.longitude,
    required this.city,
  });

  factory DeviceModel.fromMap(Map<String, dynamic> map) {
    return DeviceModel(
      id: map['id'] ?? '',
      ownerId: map['ownerId'] ?? '',
      ownerName: map['ownerName'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      category: map['category'] ?? '',
      photoUrl: map['photoUrl'],
      pricePerDay: (map['pricePerDay'] ?? 0.0).toDouble(),
      isAvailable: map['isAvailable'] ?? true,
      latitude: (map['latitude'] ?? 0.0).toDouble(),
      longitude: (map['longitude'] ?? 0.0).toDouble(),
      city: map['city'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'title': title,
      'description': description,
      'category': category,
      'photoUrl': photoUrl,
      'pricePerDay': pricePerDay,
      'isAvailable': isAvailable,
      'latitude': latitude,
      'longitude': longitude,
      'city': city,
    };
  }
}