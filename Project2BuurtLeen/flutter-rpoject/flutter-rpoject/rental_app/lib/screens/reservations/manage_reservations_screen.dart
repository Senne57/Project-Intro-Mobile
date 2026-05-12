import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/reservation_service.dart';
import '../../services/review_service.dart';
import '../../services/device_service.dart';
import '../../models/reservation_model.dart';
import '../../models/device_model.dart';
import '../reviews/review_screen.dart';
import '../devices/device_detail_screen.dart';
import 'package:intl/intl.dart';

class ManageReservationsScreen extends StatelessWidget {
  const ManageReservationsScreen({super.key});

  Color _statusColor(String status) {
    switch (status) {
      case 'approved': return Colors.green;
      case 'rejected': return Colors.red;
      case 'completed': return Colors.grey;
      default: return Colors.orange;
    }
  }

  Future<void> _confirmDelete(BuildContext context, DeviceModel device) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove device'),
        content: Text(
            'Are you sure you want to remove "${device.title}"? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await DeviceService().deleteDevice(device.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Device removed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final reservationService = ReservationService();
    final reviewService = ReviewService();
    final deviceService = DeviceService();
    final currentUserId = authService.currentUser!.uid;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // MY DEVICES SECTION
          const Text('My Devices',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          StreamBuilder<List<DeviceModel>>(
            stream: deviceService.getMyDevices(currentUserId),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              final devices = snapshot.data ?? [];
              if (devices.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('You have no devices listed yet.',
                      style: TextStyle(color: Colors.grey)),
                );
              }
              return Column(
                children: devices.map((device) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: device.photoBytes != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.memory(
                              device.photoBytes!,
                              width: 48,
                              height: 48,
                              fit: BoxFit.cover,
                            ),
                          )
                        : const CircleAvatar(
                            backgroundColor: Colors.teal,
                            child: Icon(Icons.devices_other,
                                color: Colors.white),
                          ),
                    title: Text(device.title,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold)),
                    subtitle: Text(
                        '€${device.pricePerDay.toStringAsFixed(2)}/day · ${device.city}'),
                    // ✅ Red delete button on the right
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.chevron_right),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => _confirmDelete(context, device),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DeviceDetailScreen(device: device),
                      ),
                    ),
                  ),
                )).toList(),
              );
            },
          ),

          const Divider(height: 40),

          // INCOMING RESERVATIONS SECTION
          const Text('Incoming Reservations',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          StreamBuilder<List<ReservationModel>>(
            stream: reservationService.getIncomingReservations(currentUserId),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('No incoming reservations yet.',
                      style: TextStyle(color: Colors.grey)),
                );
              }

              final reservations = snapshot.data!;
              final pending = reservations
                  .where((r) => r.status == 'pending')
                  .toList();
              final others = reservations
                  .where((r) => r.status != 'pending')
                  .toList();
              final sorted = [...pending, ...others];

              return Column(
                children: sorted.map((r) {
                  final days =
                      r.endDate.difference(r.startDate).inDays + 1;
                  return Card(
                    shape: r.status == 'pending'
                        ? const RoundedRectangleBorder(
                            side: BorderSide(color: Colors.teal, width: 2),
                            borderRadius:
                                BorderRadius.all(Radius.circular(12)),
                          )
                        : null,
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(r.deviceTitle,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _statusColor(r.status)
                                      .withOpacity(0.15),
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
                          Text('Renter: ${r.renterName}',
                              style: const TextStyle(color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text(
                            '${DateFormat('dd/MM/yyyy').format(r.startDate)} → ${DateFormat('dd/MM/yyyy').format(r.endDate)}  ($days days)',
                            style: const TextStyle(fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          Text(
                              'Total: €${r.totalPrice.toStringAsFixed(2)}',
                              style: const TextStyle(color: Colors.teal)),
                          if (r.status == 'pending') ...[
                            const SizedBox(height: 12),
                            const Row(
                              children: [
                                Icon(Icons.notifications_active,
                                    size: 14, color: Colors.teal),
                                SizedBox(width: 4),
                                Text('Action required',
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.teal,
                                        fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: const Icon(Icons.check),
                                    label: const Text('Approve'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green,
                                      foregroundColor: Colors.white,
                                    ),
                                    onPressed: () async {
                                      final user = await authService
                                          .getCurrentUserModel();
                                      await reservationService.updateStatus(
                                        r.id,
                                        'approved',
                                        ownerId: r.ownerId,
                                        ownerName: user?.name ?? 'Unknown',
                                        renterId: r.renterId,
                                        renterName: r.renterName,
                                        deviceTitle: r.deviceTitle,
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: OutlinedButton.icon(
                                    icon: const Icon(Icons.close),
                                    label: const Text('Reject'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.red,
                                      side: const BorderSide(
                                          color: Colors.red),
                                    ),
                                    onPressed: () =>
                                        reservationService.updateStatus(
                                      r.id,
                                      'rejected',
                                      renterId: r.renterId,
                                      deviceTitle: r.deviceTitle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                          if (r.status == 'completed') ...[
                            const SizedBox(height: 12),
                            FutureBuilder<bool>(
                              future: reviewService.hasReviewed(
                                  r.id, currentUserId),
                              builder: (context, reviewSnapshot) {
                                final alreadyReviewed =
                                    reviewSnapshot.data ?? false;
                                if (alreadyReviewed) {
                                  return const Row(
                                    children: [
                                      Icon(Icons.check_circle,
                                          size: 16, color: Colors.grey),
                                      SizedBox(width: 4),
                                      Text('Review submitted',
                                          style: TextStyle(
                                              color: Colors.grey,
                                              fontSize: 13)),
                                    ],
                                  );
                                }
                                return SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    icon: const Icon(Icons.star_border,
                                        color: Colors.amber),
                                    label: const Text('Review Renter',
                                        style:
                                            TextStyle(color: Colors.teal)),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(
                                          color: Colors.teal),
                                    ),
                                    onPressed: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => ReviewScreen(
                                          reservationId: r.id,
                                          targetId: r.renterId,
                                          targetName: r.renterName,
                                          deviceTitle: r.deviceTitle,
                                          isOwnerReviewing: true,
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
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}