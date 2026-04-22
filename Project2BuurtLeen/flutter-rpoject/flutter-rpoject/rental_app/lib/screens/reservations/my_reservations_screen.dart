import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/reservation_service.dart';
import '../../models/reservation_model.dart';
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

    return StreamBuilder<List<ReservationModel>>(
      stream: reservationService.getMyReservations(authService.currentUser!.uid),
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
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: reservations.length,
          itemBuilder: (context, index) {
            final r = reservations[index];
            final days = r.endDate.difference(r.startDate).inDays + 1;
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text(r.deviceTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      '${DateFormat('dd/MM/yyyy').format(r.startDate)} → ${DateFormat('dd/MM/yyyy').format(r.endDate)}  ($days days)',
                      style: const TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    Text('Total: €${r.totalPrice.toStringAsFixed(2)}',
                        style: const TextStyle(color: Colors.teal)),
                  ],
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
              ),
            );
          },
        );
      },
    );
  }
}