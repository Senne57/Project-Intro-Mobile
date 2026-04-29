import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useMessage } from "../context/MessageContext";
import { useTheme } from "../context/ThemeContext";

export default function Messages() {
  const { colors } = useTheme();
  const { conversations, currentConversation, setCurrentConversation, sendMessage, markAsRead } =
    useMessage();
  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentConversation?.messages?.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages?.length]);

  const handleSelectConversation = (conversation: any) => {
    setCurrentConversation(conversation);
    markAsRead(conversation.id);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && currentConversation) {
      sendMessage(currentConversation.id, inputMessage.trim());
      setInputMessage("");
    }
  };

  const styles = getStyles(colors);

  // ── Chat View ──────────────────────────────────────────────────────────────
  if (currentConversation) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.chatHeader, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setCurrentConversation(null)} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.button }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {currentConversation.groupName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {currentConversation.participants.length} spelers
            </Text>
          </View>
          <View style={[styles.headerAvatar, { backgroundColor: colors.button + "22" }]}>
            <Text style={styles.headerAvatarEmoji}></Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 10 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {currentConversation.messages.length === 0 && (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}></Text>
              <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                Stuur het eerste bericht!
              </Text>
            </View>
          )}

          {currentConversation.messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemMessageRow}>
                  <View style={[styles.systemBubble, { backgroundColor: colors.infoBox }]}>
                    <Text style={[styles.systemText, { color: colors.textSecondary }]}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} style={[styles.messageRow, msg.isOwn && styles.messageRowRight]}>
                {!msg.isOwn && (
                  <View style={[styles.avatarCircle, { backgroundColor: colors.button + "33" }]}>
                    <Text style={[styles.avatarInitial, { color: colors.button }]}>
                      {msg.senderName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.isOwn
                      ? { backgroundColor: colors.button }
                      : { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border },
                  ]}
                >
                  {!msg.isOwn && (
                    <Text style={[styles.senderName, { color: colors.button }]}>
                      {msg.senderName}
                    </Text>
                  )}
                  <Text style={[styles.messageText, { color: msg.isOwn ? "#fff" : colors.text }]}>
                    {msg.content}
                  </Text>
                  <Text style={[styles.messageTime, { color: msg.isOwn ? "rgba(255,255,255,0.65)" : colors.textTertiary }]}>
                    {msg.timestamp.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                maxHeight: 100,
              },
            ]}
            placeholder="Typ een bericht..."
            placeholderTextColor={colors.textTertiary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputMessage.trim() ? colors.button : colors.border },
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Conversation List ──────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Berichten</Text>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}></Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Geen groepsgesprekken
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Reserveer een wedstrijd om automatisch in een groepschat te komen!
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...conversations].sort(
            (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.conversationItem,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                item.unreadCount > 0 && { borderColor: colors.button },
              ]}
              onPress={() => handleSelectConversation(item)}
            >
              <View style={styles.conversationHeader}>
                <View style={[styles.groupAvatar, { backgroundColor: colors.button + "22" }]}>
                  <Text style={styles.groupAvatarText}></Text>
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.groupName}</Text>
                  <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
                    {item.participants.length} spelers
                  </Text>
                  <Text
                    style={[
                      styles.lastMessage,
                      { color: item.unreadCount > 0 ? colors.button : colors.textSecondary },
                      item.unreadCount > 0 && { fontWeight: "600" },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                </View>
                <View style={styles.conversationMeta}>
                  <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                    {item.lastMessageTime.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.button }]}>
                      <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, padding: 15 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyText: { fontSize: 16, marginBottom: 8, fontWeight: "bold" },
    emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    conversationItem: { borderRadius: 12, marginBottom: 10, borderWidth: 1, overflow: "hidden" },
    conversationHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
    groupAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 12 },
    groupAvatarText: { fontSize: 22 },
    conversationInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    participantsText: { fontSize: 11, marginBottom: 2 },
    lastMessage: { fontSize: 13 },
    conversationMeta: { alignItems: "flex-end", justifyContent: "center", gap: 6 },
    timestamp: { fontSize: 12 },
    badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    // Chat view
    chatHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
    backBtn: { padding: 6 },
    backArrow: { fontSize: 22, fontWeight: "bold" },
    headerInfo: { flex: 1, marginLeft: 10 },
    headerTitle: { fontSize: 15, fontWeight: "bold" },
    headerSubtitle: { fontSize: 12, marginTop: 1 },
    headerAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
    headerAvatarEmoji: { fontSize: 20 },
    messagesContainer: { flex: 1, paddingHorizontal: 14 },
    emptyChat: { alignItems: "center", marginTop: 60 },
    emptyChatEmoji: { fontSize: 48, marginBottom: 12 },
    emptyChatText: { fontSize: 15 },
    systemMessageRow: { alignItems: "center", marginVertical: 8 },
    systemBubble: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    systemText: { fontSize: 12, fontStyle: "italic" },
    messageRow: { flexDirection: "row", marginBottom: 10, justifyContent: "flex-start", alignItems: "flex-end", gap: 6 },
    messageRowRight: { justifyContent: "flex-end" },
    avatarCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 2 },
    avatarInitial: { fontSize: 13, fontWeight: "bold" },
    messageBubble: { maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
    senderName: { fontSize: 11, fontWeight: "700", marginBottom: 3 },
    messageText: { fontSize: 14, lineHeight: 20 },
    messageTime: { fontSize: 10, marginTop: 3, textAlign: "right" },
    inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
    input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1, fontSize: 14 },
    sendButton: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
    sendButtonText: { color: "#fff", fontSize: 16 },
  });
}
