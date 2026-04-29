import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:js' as js;

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _controller;

  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(50.8503, 4.3517),
    zoom: 8,
  );

  @override
  void initState() {
    super.initState();
    final apiKey = dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
    js.context.callMethod('eval', [
      '''
      var script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=$apiKey';
      document.head.appendChild(script);
      '''
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Map'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: GoogleMap(
        initialCameraPosition: _initialPosition,
        onMapCreated: (controller) => _controller = controller,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
    );
  }
}