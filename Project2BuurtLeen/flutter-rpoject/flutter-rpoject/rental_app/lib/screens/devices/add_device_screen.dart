import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../models/device_model.dart';
import '../../services/auth_service.dart';
import '../../services/device_service.dart';
import '../../services/location_service.dart';

class AddDeviceScreen extends StatefulWidget {
  const AddDeviceScreen({super.key});

  @override
  State<AddDeviceScreen> createState() => _AddDeviceScreenState();
}

class _AddDeviceScreenState extends State<AddDeviceScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final DeviceService _deviceService = DeviceService();
  final LocationService _locationService = LocationService();

  String _selectedCategory = 'Vacuum Cleaner';
  File? _imageFile;
  bool _isLoading = false;
  double? _latitude;
  double? _longitude;
  String _city = '';

  final List<String> _categories = [
    'Vacuum Cleaner',
    'Lawn Mower',
    'Kitchen',
    'Power Tools',
    'Cleaning',
    'Other',
  ];

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _imageFile = File(picked.path));
    }
  }

  Future<void> _getLocation() async {
    final position = await _locationService.getCurrentPosition();
    if (position != null) {
      final city = await _locationService.getCityFromCoordinates(
          position.latitude, position.longitude);
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _city = city;
      });
    }
  }

  Future<void> _submit() async {
    if (_titleController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _priceController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authService = Provider.of<AuthService>(context, listen: false);
    final user = await authService.getCurrentUserModel();

    final device = DeviceModel(
      id: '',
      ownerId: authService.currentUser!.uid,
      ownerName: user?.name ?? 'Unknown',
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      category: _selectedCategory,
      pricePerDay: double.tryParse(_priceController.text) ?? 0,
      latitude: _latitude ?? 0,
      longitude: _longitude ?? 0,
      city: _city,
    );

    final error = await _deviceService.addDevice(device, _imageFile);

    setState(() => _isLoading = false);

    if (mounted) {
      if (error == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Device added!'), backgroundColor: Colors.teal),
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Device'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _imageFile != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(_imageFile!, fit: BoxFit.cover))
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo,
                              size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('Tap to add photo',
                              style: TextStyle(color: Colors.grey)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Device Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.devices),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Category',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.category),
              ),
              items: _categories
                  .map((cat) =>
                      DropdownMenuItem(value: cat, child: Text(cat)))
                  .toList(),
              onChanged: (val) =>
                  setState(() => _selectedCategory = val!),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.description),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _priceController,
              decoration: const InputDecoration(
                labelText: 'Price per day (€)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.euro),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              icon: const Icon(Icons.location_on),
              label: Text(_city.isEmpty ? 'Get my location' : 'Location: $_city'),
              onPressed: _getLocation,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Add Device', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}