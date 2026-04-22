class ReservationModel {
  final String id;
  final String deviceId;
  final String deviceTitle;
  final String renterId;
  final String renterName;
  final String ownerId;
  final DateTime startDate;
  final DateTime endDate;
  final double totalPrice;
  final String status; // pending, approved, rejected, completed

  ReservationModel({
    required this.id,
    required this.deviceId,
    required this.deviceTitle,
    required this.renterId,
    required this.renterName,
    required this.ownerId,
    required this.startDate,
    required this.endDate,
    required this.totalPrice,
    this.status = 'pending',
  });

  factory ReservationModel.fromMap(Map<String, dynamic> map) {
    return ReservationModel(
      id: map['id'] ?? '',
      deviceId: map['deviceId'] ?? '',
      deviceTitle: map['deviceTitle'] ?? '',
      renterId: map['renterId'] ?? '',
      renterName: map['renterName'] ?? '',
      ownerId: map['ownerId'] ?? '',
      startDate: DateTime.parse(map['startDate']),
      endDate: DateTime.parse(map['endDate']),
      totalPrice: (map['totalPrice'] ?? 0.0).toDouble(),
      status: map['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'deviceId': deviceId,
      'deviceTitle': deviceTitle,
      'renterId': renterId,
      'renterName': renterName,
      'ownerId': ownerId,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'totalPrice': totalPrice,
      'status': status,
    };
  }
}