class UserModel {
  final String id;
  final String email;
  final String name;
  final String? photoUrl;
  final double rating;
  final int totalRatings;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
    this.rating = 0.0,
    this.totalRatings = 0,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      photoUrl: map['photoUrl'],
      rating: (map['rating'] ?? 0.0).toDouble(),
      totalRatings: map['totalRatings'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'photoUrl': photoUrl,
      'rating': rating,
      'totalRatings': totalRatings,
    };
  }
}