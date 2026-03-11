import React, { useState } from "react";
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

  const handleSelectConversation = (conversation: any) => {
    setCurrentConversation(conversation);
    markAsRead(conversation.id);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && currentConversation) {
      sendMessage(currentConversation.id, inputMessage);
      setInputMessage("");
    }
  };

  const styles = getStyles(colors);

  if (currentConversation) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.chatHeader, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setCurrentConversation(null)}>
            <Text style={styles.backButton}>← Terug</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              🎾 {currentConversation.groupName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {currentConversation.participants.length} spelers
            </Text>
          </View>
        </View>

        {/* Berichten */}
        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
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
                  <Text style={[styles.messageTime, { color: msg.isOwn ? "rgba(255,255,255,0.7)" : colors.textTertiary }]}>
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
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.button }]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>💬 Berichten</Text>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Geen groepsgesprekken
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Reserveer een wedstrijd om automatisch in een groep te komen!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.conversationItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => handleSelectConversation(item)}
            >
              <View style={styles.conversationHeader}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>🎾</Text>
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.groupName}</Text>
                  <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
                    {item.participants.length} spelers
                  </Text>
                  <Text
                    style={[styles.lastMessage, { color: item.unreadCount > 0 ? colors.button : colors.textSecondary }]}
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
    groupAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#0984e320",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    groupAvatarText: { fontSize: 24 },
    conversationInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    participantsText: { fontSize: 11, marginBottom: 2 },
    lastMessage: { fontSize: 13 },
    conversationMeta: { alignItems: "flex-end", justifyContent: "center" },
    timestamp: { fontSize: 12, marginBottom: 5 },
    badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    chatHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1 },
    backButton: { fontSize: 16, fontWeight: "bold", color: "#0984e3" },
    headerInfo: { flex: 1, marginLeft: 15 },
    headerTitle: { fontSize: 15, fontWeight: "bold" },
    headerSubtitle: { fontSize: 12, marginTop: 2 },
    messagesContainer: { flex: 1, paddingVertical: 10, paddingHorizontal: 15 },
    systemMessageRow: { alignItems: "center", marginVertical: 8 },
    systemBubble: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    systemText: { fontSize: 12, fontStyle: "italic" },
    messageRow: { flexDirection: "row", marginBottom: 10, justifyContent: "flex-start" },
    messageRowRight: { justifyContent: "flex-end" },
    messageBubble: { maxWidth: "80%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    senderName: { fontSize: 11, fontWeight: "700", marginBottom: 3 },
    messageText: { fontSize: 14, lineHeight: 20 },
    messageTime: { fontSize: 11, marginTop: 3 },
    inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
    input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, borderWidth: 1 },
    sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    sendButtonText: { fontSize: 18 },
  });
}