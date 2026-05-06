import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class LocationService {
  Future<Position?> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return null;
      }

      if (permission == LocationPermission.deniedForever) return null;

      return await Geolocator.getCurrentPosition();
    } catch (e) {
      return null;
    }
  }

  Future<String> getCityFromCoordinates(
      double latitude, double longitude) async {
    try {
      if (kIsWeb) {
        // Use Google Maps Geocoding API on web
        final apiKey = dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
        final url =
            'https://maps.googleapis.com/maps/api/geocode/json?latlng=$latitude,$longitude&key=$apiKey';
        final response = await http.get(Uri.parse(url));
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data['results'].isNotEmpty) {
            // Return the full formatted address instead of just the city
            return data['results'][0]['formatted_address'] ?? 'Unknown';
          }
        }
        return 'Unknown';
      } else {
        // Use geocoding package on mobile
        final placemarks =
            await placemarkFromCoordinates(latitude, longitude);
        if (placemarks.isNotEmpty) {
          final place = placemarks.first;
          final parts = [
            place.street,
            place.locality,
            place.postalCode,
          ].where((p) => p != null && p.isNotEmpty).toList();
          return parts.join(', ');
        }
      }
    } catch (e) {
      return 'Unknown';
    }
    return 'Unknown';
  }
}