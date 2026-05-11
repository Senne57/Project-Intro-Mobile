import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/notification_model.dart';

class NotificationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  // Creates a notification document in Firestore for a specific user
  Future<void> createNotification({
    required String userId,
    required String title,
    required String body,
  }) async {
    final id = _uuid.v4();
    final notification = NotificationModel(
      id: id,
      userId: userId,
      title: title,
      body: body,
      isRead: false,
      createdAt: DateTime.now(),
    );
    await _firestore
        .collection('notifications')
        .doc(id)
        .set(notification.toMap());
  }

  // Live stream of all notifications for the current user, newest first
  Stream<List<NotificationModel>> getNotifications(String userId) {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => NotificationModel.fromMap(doc.data()))
            .toList());
  }

  // Count of unread notifications — used for the red badge on the bell icon
  Stream<int> getUnreadCount(String userId) {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .where('isRead', isEqualTo: false)
        .snapshots()
        .map((snapshot) => snapshot.docs.length);
  }

  // Mark a single notification as read when the user opens the dropdown
  Future<void> markAsRead(String notificationId) async {
    await _firestore
        .collection('notifications')
        .doc(notificationId)
        .update({'isRead': true});
  }

  // Mark all notifications as read — called when user opens the bell dropdown
  Future<void> markAllAsRead(String userId) async {
    final unread = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .where('isRead', isEqualTo: false)
        .get();

    // Batch write is more efficient than updating one by one
    final batch = _firestore.batch();
    for (final doc in unread.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

  // Called by a scheduled check or when reservations are loaded —
  // creates a reminder notification if end date is tomorrow
  Future<void> checkAndSendEndDateReminders({
    required String userId,
    required String deviceTitle,
    required String reservationId,
    required DateTime endDate,
  }) async {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    final isEndingTomorrow = endDate.year == tomorrow.year &&
        endDate.month == tomorrow.month &&
        endDate.day == tomorrow.day;

    if (!isEndingTomorrow) return;

    // Check if we already sent this reminder to avoid duplicates
    final existing = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .where('body', isEqualTo: 'reminder_$reservationId')
        .get();

    if (existing.docs.isEmpty) {
      await createNotification(
        userId: userId,
        title: '⏰ Rental ending tomorrow',
        body: 'Your rental of "$deviceTitle" ends tomorrow. Don\'t forget to return it!',
      );
      // Store a marker so we don't send this reminder again
      await _firestore.collection('notifications').add({
        'userId': userId,
        'title': '_reminder_sent',
        'body': 'reminder_$reservationId',
        'isRead': true,
        'createdAt': Timestamp.now(),
        'id': 'marker_$reservationId',
      });
    }
  }
}