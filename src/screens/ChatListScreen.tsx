/**
 * Project Aegis - Chat List Screen
 * Shows list of conversations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { GunDBService } from '../services/gundbService';
import { ChatDetailScreen } from './ChatDetailScreen';

interface ChatListScreenProps {
  onOpenSettings?: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenSettings }) => {
  const { currentUser, appState, setOnline, logout, connectToPeer } = useApp();
  const [conversations, setConversations] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Publish online status when entering this screen
    setOnline(true);

    return () => {
      // Optional: set offline when leaving
      // setOnline(false);
    };
  }, [setOnline]);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a username to search');
      return;
    }

    setSearching(true);
    try {
      const contact = await GunDBService.searchUser(searchText.trim());

      if (contact) {
        // Add to conversations if not already there
        setConversations(prev => {
          const updated = [contact.alias, ...prev.filter(c => c !== contact.alias)];
          return updated;
        });

        // Try to connect to peer if online
        await connectToPeer(contact.alias);

        setSearchText('');
        setSelectedPeer(contact.alias);

        Alert.alert('Success', `Found @${contact.alias}!`);
      } else {
        Alert.alert('Not Found', `Could not find user @${searchText}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for user');
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Logout failed');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // Show chat detail screen if a conversation is selected
  if (selectedPeer) {
    return (
      <ChatDetailScreen
        peerAlias={selectedPeer}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Aegis Chat</Text>
          <Text style={styles.username}>@{currentUser?.alias}</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Settings Button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onOpenSettings}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
          
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                appState.isOnline ? styles.online : styles.offline,
              ]}
            />
            <Text style={styles.statusText}>
              {appState.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for user (@alice)"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
          editable={!searching}
        />
        <TouchableOpacity
          style={[styles.searchButton, searching && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={searching}
        >
          <Text style={styles.searchButtonText}>
            {searching ? '...' : '🔍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={({ item: peerAlias }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => setSelectedPeer(peerAlias)}
            >
              <View style={styles.conversationContent}>
                <Text style={styles.conversationName}>@{peerAlias}</Text>
                <Text style={styles.conversationPreview}>
                  Tap to open conversation
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyText}>
            Search for a user above to start a conversation
          </Text>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Phase 2: The Tunnel</Text>
        <Text style={styles.debugText}>
          ✓ Crypto & seeds (Phase 1){'\n'}
          ✓ WebRTC data channels{'\n'}
          ✓ Message sending/receiving{'\n'}
          ✓ ACK/READ packets{'\n'}
          ✓ Offline queue{'\n'}
          ⏳ Audio/Video (Phase 3){'\n'}
          ⏳ Background service (Phase 4)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#999',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: 18,
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 13,
    color: '#999',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    fontFamily: 'Menlo',
  },
});
