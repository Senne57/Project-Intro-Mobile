import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ReservationModel {
  final String id;
  final String deviceId;
  final String deviceTitle;
  final String renterId;
  final String renterName;
  final String ownerId;
  final DateTime startDate;
  final DateTime endDate;
  final TimeOfDay? endTime; // ✅ NEW
  final double totalPrice;
  final String status;
  final String? chatId;

  ReservationModel({
    required this.id,
    required this.deviceId,
    required this.deviceTitle,
    required this.renterId,
    required this.renterName,
    required this.ownerId,
    required this.startDate,
    required this.endDate,
    this.endTime, // ✅ NEW
    required this.totalPrice,
    this.status = 'pending',
    this.chatId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'deviceId': deviceId,
      'deviceTitle': deviceTitle,
      'renterId': renterId,
      'renterName': renterName,
      'ownerId': ownerId,
      'startDate': Timestamp.fromDate(startDate),
      'endDate': Timestamp.fromDate(endDate),
      'endTimeHour': endTime?.hour, // ✅ NEW
      'endTimeMinute': endTime?.minute, // ✅ NEW
      'totalPrice': totalPrice,
      'status': status,
      'chatId': chatId,
    };
  }

  factory ReservationModel.fromMap(Map<String, dynamic> map) {
    TimeOfDay? endTime;
    if (map['endTimeHour'] != null && map['endTimeMinute'] != null) {
      endTime = TimeOfDay(
        hour: map['endTimeHour'] as int,
        minute: map['endTimeMinute'] as int,
      );
    }

    return ReservationModel(
      id: map['id'] ?? '',
      deviceId: map['deviceId'] ?? '',
      deviceTitle: map['deviceTitle'] ?? '',
      renterId: map['renterId'] ?? '',
      renterName: map['renterName'] ?? '',
      ownerId: map['ownerId'] ?? '',
      startDate: (map['startDate'] as Timestamp).toDate(),
      endDate: (map['endDate'] as Timestamp).toDate(),
      endTime: endTime, // ✅ NEW
      totalPrice: (map['totalPrice'] as num).toDouble(),
      status: map['status'] ?? 'pending',
      chatId: map['chatId'] as String?,
    );
  }

  // ✅ NEW — combines endDate + endTime into one DateTime for comparison
  DateTime get endDateTime {
    if (endTime == null) return endDate;
    return DateTime(
      endDate.year,
      endDate.month,
      endDate.day,
      endTime!.hour,
      endTime!.minute,
    );
  }
}