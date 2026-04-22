import 'package:flutter/material.dart';
import '../models/device_model.dart';

class DeviceCard extends StatelessWidget {
  final DeviceModel device;
  final VoidCallback onTap;

  const DeviceCard({super.key, required this.device, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            device.photoUrl != null
                ? Image.network(
                    device.photoUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 160,
                      color: Colors.grey[200],
                      child: const Icon(Icons.devices_other,
                          size: 60, color: Colors.grey),
                    ),
                  )
                : Container(
                    height: 160,
                    color: Colors.grey[200],
                    child: const Icon(Icons.devices_other,
                        size: 60, color: Colors.grey),
                  ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          device.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '€${device.pricePerDay.toStringAsFixed(2)}/day',
                        style: const TextStyle(
                            color: Colors.teal, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(device.city,
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 13)),
                      const SizedBox(width: 12),
                      const Icon(Icons.category, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(device.category,
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 13)),
                    ],
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