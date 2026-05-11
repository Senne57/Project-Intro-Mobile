import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/chat_service.dart';
import 'chat_screen.dart';

class ChatsListScreen extends StatelessWidget {
  const ChatsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final currentUserId = authService.currentUser!.uid;
    final chatService = ChatService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Chats'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      // StreamBuilder listens to Firestore in real time.
      // The list updates automatically when a new message arrives.
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: chatService.getMyChats(currentUserId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final chats = snapshot.data ?? [];

          if (chats.isEmpty) {
            return const Center(
              child: Text(
                'No chats yet.\nChats appear here once a reservation is approved.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            );
          }

          return ListView.separated(
            itemCount: chats.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final chat = chats[index];
              final chatId = chat['id'] as String;
              final deviceTitle = chat['deviceTitle'] as String;
              final lastMessage = chat['lastMessage'] as String;

              // Show the other person's name in the subtitle
              // If I'm the renter, I'm chatting with the owner, and vice versa
              final isRenter = chat['renterId'] == currentUserId;
              final otherPersonName = isRenter
                  ? chat['ownerName'] as String
                  : chat['renterName'] as String;

              return ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.teal,
                  child: Icon(Icons.chat, color: Colors.white),
                ),
                title: Text(
                  deviceTitle,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'With: $otherPersonName',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    if (lastMessage.isNotEmpty)
                      Text(
                        lastMessage,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13),
                      ),
                  ],
                ),
                // Tapping a chat opens the ChatScreen for that conversation
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ChatScreen(
                        chatId: chatId,
                        deviceTitle: deviceTitle,
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}