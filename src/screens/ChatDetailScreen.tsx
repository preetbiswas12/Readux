/**
 * Project Aegis - Chat Detail Screen
 * Shows message history with a peer and allows sending new messages
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { MessageService } from '../services/MessageService';
import WebRTCService from '../services/WebRTCService';
import type { Message } from '../types';

interface ChatDetailScreenProps {
  peerAlias: string;
  onBack?: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ peerAlias, onBack }) => {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!currentUser) return;

        const history = await MessageService.getChatHistory(
          currentUser.alias,
          peerAlias,
          100
        );

        // Reverse to show newest at bottom
        setMessages(history.reverse());
        setLoading(false);

        // Check if already connected
        setIsConnected(WebRTCService.isConnected(peerAlias));
      } catch (error) {
        console.error('Load history failed:', error);
        setLoading(false);
      }
    };

    loadHistory();
  }, [peerAlias, currentUser]);

  // Listen for incoming messages
  useEffect(() => {
    const unsubscribe = MessageService.onMessage(peerAlias, (message: Message) => {
      setMessages(prev => [...prev, message]);
      flatListRef.current?.scrollToEnd();

      // Auto-send READ packet after 500ms
      setTimeout(() => {
        if (currentUser) {
          MessageService.sendREAD(currentUser.alias, peerAlias, message.id);
        }
      }, 500);
    });

    return unsubscribe;
  }, [peerAlias, currentUser]);

  // Monitor connection status
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setIsConnected(WebRTCService.isConnected(peerAlias));
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [peerAlias]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser) {
      return;
    }

    setSending(true);
    try {
      const messageId = await MessageService.sendMessage(
        currentUser.alias,
        peerAlias,
        inputText.trim(),
        'placeholder-public-key' // TODO: Get actual public key from GunDB
      );

      // Clear input
      setInputText('');

      // Add optimistic message to UI
      const optimisticMessage: Message = {
        id: messageId,
        from: currentUser.alias,
        to: peerAlias,
        content: inputText.trim(),
        timestamp: Date.now(),
        type: 'text',
        encrypted: true,
        delivered: isConnected,
        read: false,
      };

      setMessages(prev => [...prev, optimisticMessage]);
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Send message failed:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.from === currentUser?.alias;

    return (
      <View style={[styles.messageRow, isOwn && styles.ownMessageRow]}>
        <View style={[styles.messageBubble, isOwn && styles.ownBubble]}>
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isOwn && (
              <Text style={styles.ticks}>
                {item.read ? '✓✓' : item.delivered ? '✓' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.peerName}>@{peerAlias}</Text>
            <Text style={[styles.status, isConnected && styles.statusOnline]}>
              {isConnected ? '🟢 Online' : '⚪ Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Start a conversation with @{peerAlias}</Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          editable={!sending}
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusOnline: {
    color: '#34C759',
  },
  messagesList: {
    padding: 12,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: '#e5e5ea',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticks: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
