import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/review_service.dart';

class ReviewScreen extends StatefulWidget {
  final String reservationId;
  final String targetId;
  final String targetName;
  final String deviceTitle;
  final bool isOwnerReviewing;

  const ReviewScreen({
    super.key,
    required this.reservationId,
    required this.targetId,
    required this.targetName,
    required this.deviceTitle,
    required this.isOwnerReviewing,
  });

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final ReviewService _reviewService = ReviewService();
  final TextEditingController _commentController = TextEditingController();
  int _selectedRating = 0;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_selectedRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a star rating')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final authService = Provider.of<AuthService>(context, listen: false);
    final user = await authService.getCurrentUserModel();

    final error = await _reviewService.submitReview(
      reservationId: widget.reservationId,
      reviewerId: authService.currentUser!.uid,
      reviewerName: user?.name ?? 'Unknown',
      targetId: widget.targetId,
      targetName: widget.targetName,
      deviceTitle: widget.deviceTitle,
      rating: _selectedRating,
      comment: _commentController.text.trim(),
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (error == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review submitted!'),
            backgroundColor: Colors.teal,
          ),
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
    final reviewingLabel = widget.isOwnerReviewing
        ? 'Review renter: ${widget.targetName}'
        : 'Review owner: ${widget.targetName}';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave a Review'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.deviceTitle,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(reviewingLabel,
                style: const TextStyle(color: Colors.grey)),
            const Divider(height: 32),

            const Text('Rating',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: List.generate(5, (index) {
                final starIndex = index + 1;
                return GestureDetector(
                  onTap: () => setState(() => _selectedRating = starIndex),
                  child: Icon(
                    starIndex <= _selectedRating
                        ? Icons.star
                        : Icons.star_border,
                    color: Colors.amber,
                    size: 40,
                  ),
                );
              }),
            ),
            const SizedBox(height: 8),
            Text(
              _selectedRating == 0
                  ? 'Tap to rate'
                  : ['', 'Poor', 'Fair', 'Good', 'Very Good',
                      'Excellent'][_selectedRating],
              style: TextStyle(
                color: _selectedRating == 0 ? Colors.grey : Colors.teal,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Divider(height: 32),

            const Text('Comment (optional)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Share your experience...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.teal, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReview,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Submit Review',
                        style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}