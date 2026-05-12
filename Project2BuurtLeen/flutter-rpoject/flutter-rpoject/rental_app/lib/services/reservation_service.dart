import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/reservation_model.dart';
import '../services/chat_service.dart';
import '../services/notification_service.dart';
import 'package:uuid/uuid.dart';

class ReservationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();
  final ChatService _chatService = ChatService();
  final NotificationService _notificationService = NotificationService();

  Future<String?> createReservation({
    required String deviceId,
    required String deviceTitle,
    required String ownerId,
    required String renterId,
    required String renterName,
    required DateTime startDate,
    required DateTime endDate,
    required double totalPrice,
    TimeOfDay? endTime,
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
        endTime: endTime,
        totalPrice: totalPrice,
      );
      await _firestore
          .collection('reservations')
          .doc(id)
          .set(reservation.toMap());

      await _notificationService.createNotification(
        userId: ownerId,
        title: '📩 New rental request',
        body:
            '$renterName wants to rent "$deviceTitle". Check your Dashboard!',
      );

      return null;
    } catch (e) {
      return e.toString();
    }
  }

  // ✅ NEW — returns all booked dates for a device (approved reservations only)
  Future<List<DateTime>> getBookedDates(String deviceId) async {
    final snapshot = await _firestore
        .collection('reservations')
        .where('deviceId', isEqualTo: deviceId)
        .where('status', isEqualTo: 'approved')
        .get();

    final List<DateTime> bookedDates = [];
    for (final doc in snapshot.docs) {
      final r = ReservationModel.fromMap(doc.data());
      DateTime current = r.startDate;
      while (!current.isAfter(r.endDate)) {
        bookedDates.add(DateTime(current.year, current.month, current.day));
        current = current.add(const Duration(days: 1));
      }
    }
    return bookedDates;
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

  Future<void> updateStatus(
    String reservationId,
    String status, {
    String? ownerId,
    String? ownerName,
    String? renterId,
    String? renterName,
    String? deviceTitle,
  }) async {
    if (status == 'approved') {
      final chatId = await _chatService.createChat(
        reservationId: reservationId,
        renterId: renterId ?? '',
        renterName: renterName ?? '',
        ownerId: ownerId ?? '',
        ownerName: ownerName ?? '',
        deviceTitle: deviceTitle ?? '',
      );

      await _firestore
          .collection('reservations')
          .doc(reservationId)
          .update({'status': status, 'chatId': chatId});

      if (renterId != null) {
        await _notificationService.createNotification(
          userId: renterId,
          title: '✅ Reservation approved!',
          body:
              'Your request for "$deviceTitle" was approved. You can now chat with the owner.',
        );
      }
    } else if (status == 'rejected') {
      await _firestore
          .collection('reservations')
          .doc(reservationId)
          .update({'status': status});

      if (renterId != null) {
        await _notificationService.createNotification(
          userId: renterId,
          title: '❌ Reservation rejected',
          body:
              'Unfortunately your request for "$deviceTitle" was not approved.',
        );
      }
    } else {
      await _firestore
          .collection('reservations')
          .doc(reservationId)
          .update({'status': status});
    }
  }
}