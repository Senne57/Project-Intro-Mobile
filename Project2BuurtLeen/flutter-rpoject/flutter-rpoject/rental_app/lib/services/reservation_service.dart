import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/reservation_model.dart';
import 'package:uuid/uuid.dart';

class ReservationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  Future<String?> createReservation(ReservationModel reservation) async {
    try {
      final id = _uuid.v4();
      final newReservation = ReservationModel(
        id: id,
        deviceId: reservation.deviceId,
        deviceTitle: reservation.deviceTitle,
        renterId: reservation.renterId,
        renterName: reservation.renterName,
        ownerId: reservation.ownerId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        totalPrice: reservation.totalPrice,
      );
      await _firestore
          .collection('reservations')
          .doc(id)
          .set(newReservation.toMap());
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