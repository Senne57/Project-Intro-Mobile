import 'dart:convert';
import 'dart:typed_data';

class DeviceModel {
  final String id;
  final String ownerId;
  final String ownerName;
  final String title;
  final String description;
  final String category;
  final String? photoBase64;
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
    this.photoBase64,
    required this.pricePerDay,
    this.isAvailable = true,
    required this.latitude,
    required this.longitude,
    required this.city,
  });

  Uint8List? get photoBytes =>
      photoBase64 != null ? base64Decode(photoBase64!) : null;

  factory DeviceModel.fromMap(Map<String, dynamic> map) {
    return DeviceModel(
      id: map['id'] ?? '',
      ownerId: map['ownerId'] ?? '',
      ownerName: map['ownerName'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      category: map['category'] ?? '',
      photoBase64: map['photoBase64'],
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
      'photoBase64': photoBase64,
      'pricePerDay': pricePerDay,
      'isAvailable': isAvailable,
      'latitude': latitude,
      'longitude': longitude,
      'city': city,
    };
  }
}