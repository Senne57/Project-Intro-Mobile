import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_message_model.dart';

class ChatService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

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
    return chatId;
  }

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

    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(id)
        .set(message.toMap());

    await _firestore.collection('chats').doc(chatId).update({
      'lastMessage': text,
      'lastMessageTime': Timestamp.now(),
    });
  }

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

  Stream<List<Map<String, dynamic>>> getMyChats(String userId) {
    final asRenter = _firestore
        .collection('chats')
        .where('renterId', isEqualTo: userId)
        .snapshots();

    final asOwner = _firestore
        .collection('chats')
        .where('ownerId', isEqualTo: userId)
        .snapshots();

    return asRenter.asyncExpand((renterSnapshot) {
      return asOwner.map((ownerSnapshot) {
        final all = [
          ...renterSnapshot.docs.map((d) => d.data()),
          ...ownerSnapshot.docs.map((d) => d.data()),
        ];
        final seen = <String>{};
        return all.where((chat) => seen.add(chat['id'] as String)).toList();
      });
    });
  }

  // ✅ verwijder chat + alle berichten
  Future<void> deleteChat(String chatId) async {
    // verwijder eerst alle berichten in de subcollection
    final messages = await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .get();

    final batch = _firestore.batch();
    for (final doc in messages.docs) {
      batch.delete(doc.reference);
    }
    // verwijder dan het chat document zelf
    batch.delete(_firestore.collection('chats').doc(chatId));
    await batch.commit();
  }
}