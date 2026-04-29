import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import '../models/device_model.dart';
import 'package:uuid/uuid.dart';

class DeviceService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  Future<String?> addDevice(DeviceModel device, XFile? imageFile) async {
    try {
      final id = _uuid.v4();
      String? photoBase64;

      if (imageFile != null) {
        final bytes = await imageFile.readAsBytes();
        photoBase64 = base64Encode(bytes);
      }

      final newDevice = DeviceModel(
        id: id,
        ownerId: device.ownerId,
        ownerName: device.ownerName,
        title: device.title,
        description: device.description,
        category: device.category,
        photoBase64: photoBase64,
        pricePerDay: device.pricePerDay,
        isAvailable: device.isAvailable,
        latitude: device.latitude,
        longitude: device.longitude,
        city: device.city,
      );

      await _firestore.collection('devices').doc(id).set(newDevice.toMap());
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  Stream<List<DeviceModel>> getDevices({String? category}) {
    Query query = _firestore
        .collection('devices')
        .where('isAvailable', isEqualTo: true);

    if (category != null && category != 'All') {
      query = query.where('category', isEqualTo: category);
    }

    return query.snapshots().map((snapshot) => snapshot.docs
        .map((doc) => DeviceModel.fromMap(doc.data() as Map<String, dynamic>))
        .toList());
  }

  Stream<List<DeviceModel>> getMyDevices(String ownerId) {
    return _firestore
        .collection('devices')
        .where('ownerId', isEqualTo: ownerId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeviceModel.fromMap(doc.data()))
            .toList());
  }

  Future<void> deleteDevice(String deviceId) async {
    await _firestore.collection('devices').doc(deviceId).delete();
  }
}