import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/device_service.dart';
import '../../models/device_model.dart';
import '../../widgets/device_card.dart';
import '../../widgets/category_filter.dart';
import 'device_detail_screen.dart';

class DeviceListScreen extends StatefulWidget {
  const DeviceListScreen({super.key});

  @override
  State<DeviceListScreen> createState() => _DeviceListScreenState();
}

class _DeviceListScreenState extends State<DeviceListScreen> {
  final DeviceService _deviceService = DeviceService();
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Vacuum Cleaner',
    'Lawn Mower',
    'Kitchen',
    'Power Tools',
    'Cleaning',
    'Other',
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CategoryFilter(
          categories: _categories,
          selected: _selectedCategory,
          onSelected: (cat) => setState(() => _selectedCategory = cat),
        ),
        Expanded(
          child: StreamBuilder<List<DeviceModel>>(
            stream: _deviceService.getDevices(category: _selectedCategory),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.devices_other, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No devices available',
                          style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  final device = snapshot.data![index];
                  return DeviceCard(
                    device: device,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DeviceDetailScreen(device: device),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}