import 'package:cloud_firestore/cloud_firestore.dart';

class ReviewModel {
  final String id;
  final String reservationId;
  final String reviewerId;     // the person writing the review
  final String reviewerName;
  final String targetId;       // the person being reviewed
  final String targetName;
  final String deviceTitle;
  final int rating;            // 1–5 stars
  final String comment;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.reservationId,
    required this.reviewerId,
    required this.reviewerName,
    required this.targetId,
    required this.targetName,
    required this.deviceTitle,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'reservationId': reservationId,
      'reviewerId': reviewerId,
      'reviewerName': reviewerName,
      'targetId': targetId,
      'targetName': targetName,
      'deviceTitle': deviceTitle,
      'rating': rating,
      'comment': comment,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  factory ReviewModel.fromMap(Map<String, dynamic> map) {
    return ReviewModel(
      id: map['id'] ?? '',
      reservationId: map['reservationId'] ?? '',
      reviewerId: map['reviewerId'] ?? '',
      reviewerName: map['reviewerName'] ?? '',
      targetId: map['targetId'] ?? '',
      targetName: map['targetName'] ?? '',
      deviceTitle: map['deviceTitle'] ?? '',
      rating: map['rating'] ?? 0,
      comment: map['comment'] ?? '',
      createdAt: (map['createdAt'] as Timestamp).toDate(),
    );
  }
}