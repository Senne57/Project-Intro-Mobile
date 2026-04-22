import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/device_model.dart';
import '../../models/reservation_model.dart';
import '../../services/auth_service.dart';
import '../../services/reservation_service.dart';

class DeviceDetailScreen extends StatefulWidget {
  final DeviceModel device;
  const DeviceDetailScreen({super.key, required this.device});

  @override
  State<DeviceDetailScreen> createState() => _DeviceDetailScreenState();
}

class _DeviceDetailScreenState extends State<DeviceDetailScreen> {
  final ReservationService _reservationService = ReservationService();
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isLoading = false;

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  double get _totalPrice {
    if (_startDate == null || _endDate == null) return 0;
    final days = _endDate!.difference(_startDate!).inDays + 1;
    return days * widget.device.pricePerDay;
  }

  Future<void> _makeReservation() async {
    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select start and end date')),
      );
      return;
    }
    if (_endDate!.isBefore(_startDate!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End date must be after start date')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authService = Provider.of<AuthService>(context, listen: false);
    final user = await authService.getCurrentUserModel();

    final reservation = ReservationModel(
      id: '',
      deviceId: widget.device.id,
      deviceTitle: widget.device.title,
      renterId: authService.currentUser!.uid,
      renterName: user?.name ?? 'Unknown',
      ownerId: widget.device.ownerId,
      startDate: _startDate!,
      endDate: _endDate!,
      totalPrice: _totalPrice,
    );

    final error = await _reservationService.createReservation(reservation);

    setState(() => _isLoading = false);

    if (mounted) {
      if (error == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Reservation sent!'),
              backgroundColor: Colors.teal),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final device = widget.device;
    return Scaffold(
      appBar: AppBar(
        title: Text(device.title),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            device.photoUrl != null
                ? Image.network(device.photoUrl!,
                    width: double.infinity,
                    height: 220,
                    fit: BoxFit.cover)
                : Container(
                    height: 220,
                    color: Colors.grey[200],
                    child: const Icon(Icons.devices_other,
                        size: 80, color: Colors.grey),
                  ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(device.title,
                          style: const TextStyle(
                              fontSize: 22, fontWeight: FontWeight.bold)),
                      Text('€${device.pricePerDay.toStringAsFixed(2)}/day',
                          style: const TextStyle(
                              fontSize: 18,
                              color: Colors.teal,
                              fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 16, color: Colors.grey),
                      Text(device.city,
                          style: const TextStyle(color: Colors.grey)),
                      const SizedBox(width: 16),
                      const Icon(Icons.category, size: 16, color: Colors.grey),
                      Text(device.category,
                          style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Owner: ${device.ownerName}',
                      style: const TextStyle(color: Colors.grey)),
                  const Divider(height: 32),
                  const Text('Description',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(device.description),
                  const Divider(height: 32),
                  const Text('Select Rental Period',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today),
                          label: Text(_startDate == null
                              ? 'Start Date'
                              : '${_startDate!.day}/${_startDate!.month}/${_startDate!.year}'),
                          onPressed: () => _pickDate(true),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today),
                          label: Text(_endDate == null
                              ? 'End Date'
                              : '${_endDate!.day}/${_endDate!.month}/${_endDate!.year}'),
                          onPressed: () => _pickDate(false),
                        ),
                      ),
                    ],
                  ),
                  if (_startDate != null && _endDate != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Total: €${_totalPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal),
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _makeReservation,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(
                              color: Colors.white)
                          : const Text('Reserve Now',
                              style: TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}