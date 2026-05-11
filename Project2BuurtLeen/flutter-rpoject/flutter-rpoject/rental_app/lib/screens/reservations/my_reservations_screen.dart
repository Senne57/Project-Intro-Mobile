import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/reservation_service.dart';
import '../../services/review_service.dart';
import '../../services/notification_service.dart';
import '../../models/reservation_model.dart';
import '../reviews/review_screen.dart';
import 'package:intl/intl.dart';

class MyReservationsScreen extends StatelessWidget {
  const MyReservationsScreen({super.key});

  Color _statusColor(String status) {
    switch (status) {
      case 'approved': return Colors.green;
      case 'rejected': return Colors.red;
      case 'completed': return Colors.grey;
      default: return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final reservationService = ReservationService();
    final reviewService = ReviewService();
    final notificationService = NotificationService();
    final currentUserId = authService.currentUser!.uid;

    return StreamBuilder<List<ReservationModel>>(
      stream: reservationService.getMyReservations(currentUserId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.calendar_today, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No rentals yet',
                    style: TextStyle(color: Colors.grey, fontSize: 16)),
              ],
            ),
          );
        }

        final reservations = snapshot.data!;

        for (final r in reservations) {
          if (r.status == 'approved') {
            notificationService.checkAndSendEndDateReminders(
              userId: currentUserId,
              deviceTitle: r.deviceTitle,
              reservationId: r.id,
              endDate: r.endDate,
            );
          }
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: reservations.length,
          itemBuilder: (context, index) {
            final r = reservations[index];
            final days = r.endDate.difference(r.startDate).inDays + 1;

            // ✅ Use endDateTime (includes time) to check if rental is over
            final isRentalOver = r.endDateTime.isBefore(DateTime.now());
            final canReview = r.status == 'approved' && isRentalOver
                || r.status == 'completed';

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title + status badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(r.deviceTitle,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: _statusColor(r.status).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            r.status.toUpperCase(),
                            style: TextStyle(
                                color: _statusColor(r.status),
                                fontWeight: FontWeight.bold,
                                fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Dates
                    Text(
                      '${DateFormat('dd/MM/yyyy').format(r.startDate)} → ${DateFormat('dd/MM/yyyy').format(r.endDate)}  ($days days)',
                      style: const TextStyle(fontSize: 13),
                    ),

                    // ✅ Show return time if set
                    if (r.endTime != null) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.access_time,
                              size: 13, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            'Return by: ${r.endTime!.hour.toString().padLeft(2, '0')}:${r.endTime!.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(
                                fontSize: 13, color: Colors.grey),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 4),
                    Text('Total: €${r.totalPrice.toStringAsFixed(2)}',
                        style: const TextStyle(color: Colors.teal)),

                    // ✅ Review button — appears once endDateTime has passed
                    if (canReview) ...[
                      const SizedBox(height: 12),
                      FutureBuilder<bool>(
                        future: reviewService.hasReviewed(r.id, currentUserId),
                        builder: (context, reviewSnapshot) {
                          final alreadyReviewed = reviewSnapshot.data ?? false;
                          if (alreadyReviewed) {
                            return const Row(
                              children: [
                                Icon(Icons.check_circle,
                                    size: 16, color: Colors.grey),
                                SizedBox(width: 4),
                                Text('Review submitted',
                                    style: TextStyle(
                                        color: Colors.grey, fontSize: 13)),
                              ],
                            );
                          }
                          return SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.star_border,
                                  color: Colors.amber),
                              label: const Text('Leave a Review',
                                  style: TextStyle(color: Colors.teal)),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Colors.teal),
                              ),
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ReviewScreen(
                                    reservationId: r.id,
                                    targetId: r.ownerId,
                                    targetName: 'the owner',
                                    deviceTitle: r.deviceTitle,
                                    isOwnerReviewing: false,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}