import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/notification_model.dart';

class NotificationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

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

  // ✅ orderBy verwijderd, sorteren client-side
  Stream<List<NotificationModel>> getNotifications(String userId) {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
          final notifications = snapshot.docs
              .map((doc) => NotificationModel.fromMap(doc.data()))
              .toList();
          notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return notifications;
        });
  }

  // ✅ orderBy verwijderd
  Stream<int> getUnreadCount(String userId) {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .where('isRead', isEqualTo: false)
        .snapshots()
        .map((snapshot) => snapshot.docs.length);
  }

  Future<void> markAsRead(String notificationId) async {
    await _firestore
        .collection('notifications')
        .doc(notificationId)
        .update({'isRead': true});
  }

  Future<void> markAllAsRead(String userId) async {
    final unread = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .where('isRead', isEqualTo: false)
        .get();

    final batch = _firestore.batch();
    for (final doc in unread.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

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