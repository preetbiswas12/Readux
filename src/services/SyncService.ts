/**
 * Project Aegis - Sync Service
 * Handles multi-device message history synchronization
 * Peer-to-peer sync via local network
 */

import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';
import { SQLiteService } from './SQLiteService';

/**
 * Sync Protocol Data Structures
 */
interface SyncRequest {
  syncId: string;
  deviceId: string;
  deviceName: string;
  timestamp: number;
  type: 'full' | 'incremental'; // full = all history, incremental = only new
  lastSyncTime?: number; // For incremental syncs
  userAlias: string;
}

interface SyncResponse {
  syncId: string;
  deviceId: string;
  success: boolean;
  messageCount: number;
  contactCount: number;
  lastMessage?: Message;
  timestamp: number;
  checksum: string; // Simple hash of synced data
}

interface SyncPayload {
  syncId: string;
  type: 'full' | 'incremental';
  messages: Message[];
  contacts: { alias: string; publicKey: string; timestamp: number }[];
  metadata: {
    startTime: number;
    endTime: number;
    messageCount: number;
    checksum: string;
  };
}

interface SyncState {
  syncId: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  progress: number; // 0-100
  messagesSynced: number;
  totalMessages: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

/**
 * Sync Service (Singleton)
 * Manages multi-device synchronization via P2P connections
 */
class SyncService {
  private deviceId: string = uuidv4();
  private syncSessions: Map<string, SyncState> = new Map();
  private activeSyncs: Map<string, SyncPayload> = new Map();
  private syncHandlers: Map<string, (payload: SyncPayload) => void> = new Map();
  private syncCompleteHandlers: Map<string, (response: SyncResponse) => void> = new Map();

  constructor() {
    console.log(`🔄 SyncService initialized (Device ID: ${this.deviceId})`);
  }

  /**
   * Get device ID (unique identifier for this device)
   */
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Calculate simple checksum of messages
   */
  private calculateChecksum(messages: Message[]): string {
    let checksum = 0;
    for (const msg of messages) {
      for (let i = 0; i < msg.id.length; i++) {
        checksum = (checksum + msg.id.charCodeAt(i)) % 0xFFFFFFFF;
      }
      checksum = (checksum + msg.timestamp) % 0xFFFFFFFF;
    }
    return checksum.toString(16);
  }

  /**
   * Create a sync request for new device setup
   */
  async createSyncRequest(
    userAlias: string,
    deviceName: string,
    type: 'full' | 'incremental' = 'full',
    lastSyncTime?: number
  ): Promise<SyncRequest> {
    const syncRequest: SyncRequest = {
      syncId: uuidv4(),
      deviceId: this.deviceId,
      deviceName,
      timestamp: Date.now(),
      type,
      lastSyncTime,
      userAlias,
    };

    console.log(`📱 Sync request created (${type}): ${syncRequest.syncId}`);
    return syncRequest;
  }

  /**
   * Export message history for syncing
   */
  async exportMessageHistory(
    userAlias: string,
    type: 'full' | 'incremental' = 'full',
    lastSyncTime?: number
  ): Promise<SyncPayload> {
    const syncId = uuidv4();
    const startTime = Date.now();

    try {
      // Fetch all messages or only new ones since last sync
      const messages = type === 'full'
        ? await SQLiteService.getAllMessages(userAlias)
        : lastSyncTime
        ? await SQLiteService.getMessagesSince(userAlias, lastSyncTime)
        : [];

      // Fetch contacts
      const contacts = await SQLiteService.getAllContacts();

      const checksum = this.calculateChecksum(messages);
      const payload: SyncPayload = {
        syncId,
        type,
        messages,
        contacts: contacts.map(c => ({
          alias: c.alias,
          publicKey: c.publicKey,
          timestamp: c.timestamp || Date.now(),
        })),
        metadata: {
          startTime,
          endTime: Date.now(),
          messageCount: messages.length,
          checksum,
        },
      };

      this.activeSyncs.set(syncId, payload);

      console.log(`📦 Exported ${messages.length} messages for sync: ${syncId}`);
      return payload;
    } catch (error) {
      console.error('Export history failed:', error);
      throw error;
    }
  }

  /**
   * Import message history from another device
   */
  async importMessageHistory(payload: SyncPayload, userAlias: string): Promise<SyncResponse> {
    const syncId = payload.syncId;
    const startTime = Date.now();

    const syncState: SyncState = {
      syncId,
      status: 'syncing',
      progress: 0,
      messagesSynced: 0,
      totalMessages: payload.messages.length,
      startTime,
    };

    this.syncSessions.set(syncId, syncState);

    try {
      // Merge messages (avoid duplicates by ID)
      const existingMessages = await SQLiteService.getAllMessages(userAlias);
      const existingIds = new Set(existingMessages.map(m => m.id));
      let mergedCount = 0;

      for (const msg of payload.messages) {
        if (!existingIds.has(msg.id)) {
          await SQLiteService.saveMessage(msg);
          mergedCount++;
        }
      }

      syncState.messagesSynced = mergedCount;
      syncState.progress = (mergedCount / payload.messages.length) * 100;

      // Merge contacts
      for (const contact of payload.contacts) {
        await SQLiteService.addContact(contact.alias, contact.publicKey);
      }

      // Verify data integrity
      const allMessages = await SQLiteService.getAllMessages(userAlias);
      const localChecksum = this.calculateChecksum(allMessages);

      syncState.status = 'completed';
      syncState.endTime = Date.now();
      syncState.progress = 100;

      const response: SyncResponse = {
        syncId,
        deviceId: this.deviceId,
        success: true,
        messageCount: payload.messages.length,
        contactCount: payload.contacts.length,
        lastMessage: payload.messages[payload.messages.length - 1],
        timestamp: Date.now(),
        checksum: localChecksum,
      };

      console.log(
        `✅ Sync completed: ${mergedCount} messages merged, ${payload.contacts.length} contacts synced`
      );

      // Trigger sync complete handler
      const handler = this.syncCompleteHandlers.get(syncId);
      if (handler) {
        handler(response);
      }

      return response;
    } catch (error) {
      syncState.status = 'failed';
      syncState.error = error instanceof Error ? error.message : 'Unknown error';
      syncState.endTime = Date.now();

      console.error('Import history failed:', error);

      const response: SyncResponse = {
        syncId,
        deviceId: this.deviceId,
        success: false,
        messageCount: 0,
        contactCount: 0,
        timestamp: Date.now(),
        checksum: '',
      };

      return response;
    }
  }

  /**
   * Handle incoming sync request from peer
   */
  async handleSyncRequest(request: SyncRequest): Promise<SyncPayload | null> {
    try {
      console.log(`📱 Sync request received from device: ${request.deviceName}`);

      // Export history based on request type
      const payload = await this.exportMessageHistory(
        request.userAlias,
        request.type,
        request.lastSyncTime
      );

      return payload;
    } catch (error) {
      console.error('Handle sync request failed:', error);
      return null;
    }
  }

  /**
   * Handle incoming sync payload
   */
  async handleSyncPayload(payload: SyncPayload, userAlias: string): Promise<void> {
    try {
      const response = await this.importMessageHistory(payload, userAlias);

      // Trigger sync complete handler
      const handler = this.syncCompleteHandlers.get(payload.syncId);
      if (handler) {
        handler(response);
      }

      console.log(`✓ Sync payload processed: ${payload.syncId}`);
    } catch (error) {
      console.error('Handle sync payload failed:', error);
    }
  }

  /**
   * Get sync state/progress
   */
  getSyncState(syncId: string): SyncState | undefined {
    return this.syncSessions.get(syncId);
  }

  /**
   * Get all active syncs
   */
  getActiveSyncs(): SyncState[] {
    return Array.from(this.syncSessions.values());
  }

  /**
   * Cancel a sync operation
   */
  cancelSync(syncId: string): void {
    const state = this.syncSessions.get(syncId);
    if (state) {
      state.status = 'failed';
      state.error = 'Sync cancelled by user';
      state.endTime = Date.now();
      console.log(`⏸️ Sync cancelled: ${syncId}`);
    }
  }

  /**
   * Register handler for incoming sync payloads
   */
  onSyncPayload(syncId: string, handler: (payload: SyncPayload) => void): () => void {
    this.syncHandlers.set(syncId, handler);

    return () => {
      this.syncHandlers.delete(syncId);
    };
  }

  /**
   * Register handler for sync completion
   */
  onSyncComplete(syncId: string, handler: (response: SyncResponse) => void): () => void {
    this.syncCompleteHandlers.set(syncId, handler);

    return () => {
      this.syncCompleteHandlers.delete(syncId);
    };
  }

  /**
   * Check if device is synced with peer
   */
  async isDeviceSynced(userAlias: string, otherDeviceId: string): Promise<boolean> {
    const allMessages = await SQLiteService.getAllMessages(userAlias);
    return allMessages.length > 0;
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(userAlias: string): Promise<number> {
    const messages = await SQLiteService.getAllMessages(userAlias);
    if (messages.length === 0) return 0;

    // Return timestamp of most recent message
    return messages.reduce((max, msg) => Math.max(max, msg.timestamp), 0);
  }

  /**
   * Clear sync history
   */
  clearSyncSessions(): void {
    this.syncSessions.clear();
    this.activeSyncs.clear();
    console.log('🗑️ Sync sessions cleared');
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    totalSyncs: number;
    completedSyncs: number;
    failedSyncs: number;
    activeSyncs: number;
  } {
    const stats = {
      totalSyncs: this.syncSessions.size,
      completedSyncs: 0,
      failedSyncs: 0,
      activeSyncs: 0,
    };

    for (const state of this.syncSessions.values()) {
      if (state.status === 'completed') stats.completedSyncs++;
      else if (state.status === 'failed') stats.failedSyncs++;
      else if (state.status === 'syncing') stats.activeSyncs++;
    }

    return stats;
  }
}

export default new SyncService();
