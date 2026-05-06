import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart'; // ✅ NEW — same package already used in MapScreen
import 'dart:js' as js;                                        // ✅ NEW — same dart:js you already use in MapScreen
import 'package:flutter_dotenv/flutter_dotenv.dart';           // ✅ NEW — same dotenv you already use in MapScreen
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

  // ✅ NEW — controller for the embedded Google Map
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    // ✅ NEW — inject the Google Maps JS script the same way MapScreen does
    // This is necessary for the map to render on Flutter Web
    // The window._mapsLoaded check prevents loading the script twice
    // if the user navigates back and into another device
    final apiKey = dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
    js.context.callMethod('eval', [
      '''
      if (!window._mapsLoaded) {
        var script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=$apiKey';
        document.head.appendChild(script);
        window._mapsLoaded = true;
      }
      '''
    ]);
  }

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

    // ✅ BUG FIX — using named parameters to match your updated ReservationService
    // Old code: createReservation(reservation)  ← positional arg, caused the error
    // New code: createReservation(deviceId: ...) ← named params, matches the service
    final error = await _reservationService.createReservation(
      deviceId: widget.device.id,
      deviceTitle: widget.device.title,
      ownerId: widget.device.ownerId,
      renterId: authService.currentUser!.uid,
      renterName: user?.name ?? 'Unknown',
      startDate: _startDate!,
      endDate: _endDate!,
      totalPrice: _totalPrice,
    );

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

    // ✅ NEW — defines the red pin that appears on the map
    // MarkerId just needs to be a unique string
    // InfoWindow is the little popup that shows when you tap the pin
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
            // Device image — unchanged
            SizedBox(
              height: 220,
              width: double.infinity,
              child: device.photoBytes != null
                  ? ClipRect(
                      child: Image.memory(
                        device.photoBytes!,
                        width: double.infinity,
                        height: 220,
                        fit: BoxFit.cover,
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
                  // Title + price — unchanged
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          device.title,
                          style: const TextStyle(
                              fontSize: 22, fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
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

                  // Location + category row — unchanged
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

                  // Owner — unchanged
                  Text('Owner: ${device.ownerName}',
                      style: const TextStyle(color: Colors.grey)),
                  const Divider(height: 32),

                  // Description — unchanged
                  const Text('Description',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(device.description),
                  const Divider(height: 32),

                  // ✅ NEW SECTION START ─────────────────────────────────────
                  // Embedded Google Map — shows a 220px interactive map
                  // with a red pin on the device's exact saved coordinates.
                  // ClipRRect gives it rounded corners to match the card style.
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
                          // Centers map on the device's latitude/longitude
                          target: LatLng(device.latitude, device.longitude),
                          zoom: 15, // Street-level zoom like in your screenshot
                        ),
                        markers: markers,
                        zoomControlsEnabled: true,
                        myLocationButtonEnabled: false,
                        onMapCreated: (controller) {
                          _mapController = controller;
                        },
                      ),
                    ),
                  ),
                  // ✅ NEW SECTION END ───────────────────────────────────────

                  const Divider(height: 32),

                  // Rental period picker — unchanged
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

                  // Total price — unchanged
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

                  // Reserve Now button — unchanged except named params fix above
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