import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/review_model.dart';

class ReviewService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  // Submit a review — called from the review screen
  Future<String?> submitReview({
    required String reservationId,
    required String reviewerId,
    required String reviewerName,
    required String targetId,
    required String targetName,
    required String deviceTitle,
    required int rating,
    required String comment,
  }) async {
    try {
      final id = _uuid.v4();
      final review = ReviewModel(
        id: id,
        reservationId: reservationId,
        reviewerId: reviewerId,
        reviewerName: reviewerName,
        targetId: targetId,
        targetName: targetName,
        deviceTitle: deviceTitle,
        rating: rating,
        comment: comment,
        createdAt: DateTime.now(),
      );
      await _firestore.collection('reviews').doc(id).set(review.toMap());

      // Mark this reservation as reviewed by this user so the button disappears
      // We store reviewedBy as a list so both renter and owner can mark it
      await _firestore.collection('reservations').doc(reservationId).update({
        'reviewedBy': FieldValue.arrayUnion([reviewerId]),
      });

      return null;
    } catch (e) {
      return e.toString();
    }
  }

  // Get all reviews written ABOUT a specific user — shown on their profile
  Stream<List<ReviewModel>> getReviewsForUser(String userId) {
    return _firestore
        .collection('reviews')
        .where('targetId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
          final reviews = snapshot.docs
              .map((doc) => ReviewModel.fromMap(doc.data()))
              .toList();
          reviews.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return reviews;
        });
  }

  // Check if the current user already reviewed this reservation
  // Used to hide the "Leave Review" button if they already did
  Future<bool> hasReviewed(String reservationId, String userId) async {
    final doc = await _firestore
        .collection('reservations')
        .doc(reservationId)
        .get();
    final reviewedBy = List<String>.from(doc.data()?['reviewedBy'] ?? []);
    return reviewedBy.contains(userId);
  }
}