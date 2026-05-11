import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_message_model.dart';

class ChatService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  // ── CREATE ──────────────────────────────────────────────────────────────────

  // Called by ReservationService when an owner approves a reservation.
  // Creates an empty chat document in Firestore under 'chats/{chatId}'.
  // We store renterId, ownerId and deviceTitle so we can show them in the chat list.
  Future<String> createChat({
    required String reservationId,
    required String renterId,
    required String renterName,
    required String ownerId,
    required String ownerName,
    required String deviceTitle,
  }) async {
    final chatId = _uuid.v4();
    await _firestore.collection('chats').doc(chatId).set({
      'id': chatId,
      'reservationId': reservationId,
      'renterId': renterId,
      'renterName': renterName,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'deviceTitle': deviceTitle,
      'lastMessage': '',
      'lastMessageTime': Timestamp.now(),
    });
    return chatId; // returned so reservation_service can save it on the reservation
  }

  // ── SEND ────────────────────────────────────────────────────────────────────

  // Sends a message by writing to 'chats/{chatId}/messages/{messageId}'
  // Also updates lastMessage on the parent chat doc so the chat list can show a preview
  Future<void> sendMessage({
    required String chatId,
    required String senderId,
    required String senderName,
    required String text,
  }) async {
    final id = _uuid.v4();
    final message = ChatMessageModel(
      id: id,
      senderId: senderId,
      senderName: senderName,
      text: text,
      timestamp: DateTime.now(),
    );

    // Write the message into the subcollection
    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(id)
        .set(message.toMap());

    // Update the parent chat doc with a preview of the last message
    // This is what the chat list screen uses to show "last message"
    await _firestore.collection('chats').doc(chatId).update({
      'lastMessage': text,
      'lastMessageTime': Timestamp.now(),
    });
  }

  // ── READ ─────────────────────────────────────────────────────────────────────

  // Returns a live stream of messages for a given chat, ordered oldest-first
  // Stream means Firestore pushes updates in real time — no need to refresh
  Stream<List<ChatMessageModel>> getMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ChatMessageModel.fromMap(doc.data()))
            .toList());
  }

  // Returns all chats where the current user is either the renter or the owner
  // Used by the Chats tab to list all conversations
  Stream<List<Map<String, dynamic>>> getMyChats(String userId) {
    // Firestore doesn't support OR queries across different fields directly,
    // so we run two separate queries and merge them in the app
    final asRenter = _firestore
        .collection('chats')
        .where('renterId', isEqualTo: userId)
        .snapshots();

    final asOwner = _firestore
        .collection('chats')
        .where('ownerId', isEqualTo: userId)
        .snapshots();

    // Combine both streams: whenever either updates, merge and deduplicate
    return asRenter.asyncExpand((renterSnapshot) {
      return asOwner.map((ownerSnapshot) {
        final all = [
          ...renterSnapshot.docs.map((d) => d.data()),
          ...ownerSnapshot.docs.map((d) => d.data()),
        ];
        // Deduplicate by chat id in case the user is somehow both renter and owner
        final seen = <String>{};
        return all.where((chat) => seen.add(chat['id'] as String)).toList();
      });
    });
  }
}