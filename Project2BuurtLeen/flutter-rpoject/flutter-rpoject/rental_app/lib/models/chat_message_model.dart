import 'package:cloud_firestore/cloud_firestore.dart';

class ChatMessageModel {
  final String id;
  final String senderId;
  final String senderName;
  final String text;
  final DateTime timestamp;

  ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
  });

  // Converts this object into a Map so Firestore can store it
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'text': text,
      // Firestore has its own timestamp type — we convert from Dart's DateTime
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }

  // Converts a Firestore document back into a ChatMessageModel object
  factory ChatMessageModel.fromMap(Map<String, dynamic> map) {
    return ChatMessageModel(
      id: map['id'] ?? '',
      senderId: map['senderId'] ?? '',
      senderName: map['senderName'] ?? '',
      text: map['text'] ?? '',
      // Firestore returns a Timestamp — we convert it back to Dart's DateTime
      timestamp: (map['timestamp'] as Timestamp).toDate(),
    );
  }
}