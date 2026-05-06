import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/reservation_model.dart';
import 'package:uuid/uuid.dart';

class ReservationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  Future<String?> createReservation({
    required String deviceId,
    required String deviceTitle,
    required String ownerId,
    required String renterId,
    required String renterName,
    required DateTime startDate,
    required DateTime endDate,
    required double totalPrice,
  }) async {
    try {
      final id = _uuid.v4();
      final reservation = ReservationModel(
        id: id,
        deviceId: deviceId,
        deviceTitle: deviceTitle,
        renterId: renterId,
        renterName: renterName,
        ownerId: ownerId,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice,
      );
      await _firestore
          .collection('reservations')
          .doc(id)
          .set(reservation.toMap());
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  Stream<List<ReservationModel>> getMyReservations(String renterId) {
    return _firestore
        .collection('reservations')
        .where('renterId', isEqualTo: renterId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ReservationModel.fromMap(doc.data()))
            .toList());
  }

  Stream<List<ReservationModel>> getIncomingReservations(String ownerId) {
    return _firestore
        .collection('reservations')
        .where('ownerId', isEqualTo: ownerId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ReservationModel.fromMap(doc.data()))
            .toList());
  }

  Future<void> updateStatus(String reservationId, String status) async {
    await _firestore
        .collection('reservations')
        .doc(reservationId)
        .update({'status': status});
  }
}