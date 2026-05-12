import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/device_model.dart';
import '../../models/reservation_model.dart';
import '../../services/auth_service.dart';
import '../../services/reservation_service.dart';
import '../chat/chat_screen.dart';
import '../profile/public_profile_screen.dart';

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
  TimeOfDay? _endTime;
  bool _isLoading = false;
  List<DateTime> _bookedDates = [];
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    _loadBookedDates();
  }

  Future<void> _loadBookedDates() async {
    final dates =
        await _reservationService.getBookedDates(widget.device.id);
    setState(() => _bookedDates = dates);
  }

  bool _isBooked(DateTime date) {
    return _bookedDates.any((d) =>
        d.year == date.year &&
        d.month == date.month &&
        d.day == date.day);
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      // ✅ Grey out already booked dates
      selectableDayPredicate: (day) => !_isBooked(day),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: Colors.teal),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
          _pickEndTime();
        }
      });
    }
  }

  Future<void> _pickEndTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 17, minute: 0),
      helpText: 'What time will you be done?',
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: Colors.teal),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _endTime = picked);
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
        const SnackBar(
            content: Text('End date must be after start date')),
      );
      return;
    }
    if (_endTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a return time')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authService = Provider.of<AuthService>(context, listen: false);
    final user = await authService.getCurrentUserModel();

    final error = await _reservationService.createReservation(
      deviceId: widget.device.id,
      deviceTitle: widget.device.title,
      ownerId: widget.device.ownerId,
      renterId: authService.currentUser!.uid,
      renterName: user?.name ?? 'Unknown',
      startDate: _startDate!,
      endDate: _endDate!,
      endTime: _endTime,
      totalPrice: _totalPrice,
    );

    setState(() => _isLoading = false);

    if (mounted) {
      if (error == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Reservation sent! Waiting for approval.'),
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
    final authService = Provider.of<AuthService>(context, listen: false);
    final currentUserId = authService.currentUser!.uid;
    final isOwner = device.ownerId == currentUserId;

    final Set<Marker> markers = {
      Marker(
        markerId: const MarkerId('device_location'),
        position: LatLng(device.latitude, device.longitude),
        infoWindow: InfoWindow(
          title: device.title,
          snippet: device.city,
        ),
      ),
    };

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
            SizedBox(
              height: 220,
              width: double.infinity,
              child: device.photoBytes != null
                  ? Container(
                      color: Colors.grey[100],
                      child: Image.memory(
                        device.photoBytes!,
                        width: double.infinity,
                        height: 220,
                        fit: BoxFit.contain,
                      ),
                    )
                  : Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.devices_other,
                          size: 80, color: Colors.grey),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(device.title,
                            style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '€${device.pricePerDay.toStringAsFixed(2)}/day',
                        style: const TextStyle(
                            fontSize: 18,
                            color: Colors.teal,
                            fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(device.city,
                          style: const TextStyle(color: Colors.grey)),
                      const SizedBox(width: 16),
                      const Icon(Icons.category,
                          size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(device.category,
                          style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.person,
                          size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('Owner: ${device.ownerName}',
                          style: const TextStyle(color: Colors.grey)),
                      const Spacer(),
                      // ✅ Only show "View Profile" if you're not the owner
                      if (!isOwner)
                        TextButton.icon(
                          icon: const Icon(Icons.star,
                              color: Colors.amber, size: 16),
                          label: const Text('View Profile',
                              style: TextStyle(
                                  color: Colors.teal, fontSize: 13)),
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PublicProfileScreen(
                                userId: device.ownerId,
                                userName: device.ownerName,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const Divider(height: 32),
                  const Text('Description',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(device.description),
                  const Divider(height: 32),
                  const Text('Location',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      height: 220,
                      child: GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: LatLng(
                              device.latitude, device.longitude),
                          zoom: 15,
                        ),
                        markers: markers,
                        zoomControlsEnabled: true,
                        myLocationButtonEnabled: false,
                        onMapCreated: (controller) =>
                            _mapController = controller,
                      ),
                    ),
                  ),
                  const Divider(height: 32),

                  // ✅ Only show chat + reservation if NOT the owner
                  if (!isOwner) ...[
                    StreamBuilder<List<ReservationModel>>(
                      stream: _reservationService
                          .getMyReservations(currentUserId),
                      builder: (context, snapshot) {
                        final reservations = snapshot.data ?? [];
                        final approvedReservation = reservations
                            .where((r) =>
                                r.deviceId == device.id &&
                                r.status == 'approved' &&
                                r.chatId != null)
                            .firstOrNull;

                        if (approvedReservation == null) {
                          return const SizedBox.shrink();
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Chat',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: const Icon(
                                    Icons.chat_bubble_outline),
                                label: const Text('Chat with Owner',
                                    style: TextStyle(fontSize: 16)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.teal,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 14),
                                ),
                                onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ChatScreen(
                                      chatId: approvedReservation.chatId!,
                                      deviceTitle: device.title,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const Divider(height: 32),
                          ],
                        );
                      },
                    ),
                    const Text('Select Rental Period',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    // ✅ Show booked dates info
                    if (_bookedDates.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: Colors.orange.withOpacity(0.3)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info_outline,
                                size: 16, color: Colors.orange),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Some dates are already booked and will be greyed out in the calendar.',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.orange),
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 4),
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
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.access_time),
                      label: Text(_endTime == null
                          ? 'Select return time'
                          : 'Return time: ${_endTime!.format(context)}'),
                      onPressed: _pickEndTime,
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
                          padding:
                              const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white)
                            : const Text('Reserve Now',
                                style: TextStyle(fontSize: 16)),
                      ),
                    ),
                  ],

                  // ✅ Show message if owner is viewing their own device
                  if (isOwner) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.teal.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: Colors.teal.withOpacity(0.3)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.teal),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'This is your device. Manage reservations in your Dashboard.',
                              style: TextStyle(color: Colors.teal),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}