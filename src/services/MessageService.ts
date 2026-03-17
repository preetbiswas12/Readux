/**
 * Project Aegis - Message Service
 * Handles message encryption, sending, receiving, and delivery tracking
 */

import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';
import { CryptoService } from './CryptoService';
import { SQLiteService } from './SQLiteService';
import WebRTCService from './WebRTCService';

export enum MessageType {
  TEXT = 'text',
  ACK = 'ack',
  READ = 'read',
}

interface MessagePacket {
  id: string;
  from: string;
  to: string;
  content?: string; // For text messages
  encryptedContent?: string;
  timestamp: number;
  type: MessageType;
  nonce?: string;
}

export class MessageService {
  private static messageHandlers: Map<string, (message: Message) => void> = new Map();
  private static ackHandlers: Map<string, () => void> = new Map();
  private static readHandlers: Map<string, () => void> = new Map();

  /**
   * Send a text message to a peer
   * Queues locally if peer is offline
   */
  static async sendMessage(
    fromAlias: string,
    toAlias: string,
    content: string,
    recipientPublicKey: string
  ): Promise<string> {
    const messageId = uuidv4();

    try {
      // Create message packet
      const packet: MessagePacket = {
        id: messageId,
        from: fromAlias,
        to: toAlias,
        content,
        timestamp: Date.now(),
        type: MessageType.TEXT,
        nonce: CryptoService.generateNonce(),
      };

      // Encrypt content with recipient's public key (Phase 2: placeholder)
      // In Phase 3, will use libsignal Double Ratchet
      packet.encryptedContent = CryptoService.encryptMessage(
        content,
        recipientPublicKey
      );

      // Try to send via WebRTC if connected
      const sent = await WebRTCService.sendMessage(toAlias, packet);

      // Always save to local history
      const message: Message = {
        id: messageId,
        from: fromAlias,
        to: toAlias,
        content,
        timestamp: packet.timestamp,
        type: 'text',
        encrypted: true,
        delivered: sent,
        read: false,
      };

      await SQLiteService.saveMessage(message);

      // If not sent, queue for later
      if (!sent) {
        await SQLiteService.addPendingMessage(
          toAlias,
          content,
          packet.encryptedContent
        );
        console.log(`📌 Message queued (offline): ${messageId}`);
      } else {
        console.log(`✓ Message sent: ${messageId}`);
      }

      return messageId;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  /**
   * Handle incoming message packet from peer
   */
  static async handleIncomingMessage(packet: MessagePacket): Promise<void> {
    try {
      // Decrypt content (Phase 2: placeholder)
      const decryptedContent = CryptoService.decryptMessage(
        packet.encryptedContent || '',
        packet.content || ''
      );

      const message: Message = {
        id: packet.id,
        from: packet.from,
        to: packet.to,
        content: decryptedContent,
        timestamp: packet.timestamp,
        type: 'text',
        encrypted: true,
        delivered: true,
        read: false,
      };

      // Save to local database
      await SQLiteService.saveMessage(message);

      // Send ACK packet
      await this.sendACK(packet.to, packet.from, packet.id);

      // Trigger message handler
      const handler = this.messageHandlers.get(packet.from);
      if (handler) {
        handler(message);
      }

      console.log(`💬 Message received: ${packet.id} from @${packet.from}`);
    } catch (error) {
      console.error('Handle incoming message failed:', error);
    }
  }

  /**
   * Send ACK packet (double tick - delivered)
   */
  static async sendACK(fromAlias: string, toAlias: string, messageId: string): Promise<void> {
    try {
      const ackPacket: MessagePacket = {
        id: `ack-${messageId}`,
        from: fromAlias,
        to: toAlias,
        timestamp: Date.now(),
        type: MessageType.ACK,
      };

      await WebRTCService.sendMessage(toAlias, ackPacket);
      console.log(`✓ ACK sent for message: ${messageId}`);
    } catch (error) {
      console.error('Send ACK failed:', error);
    }
  }

  /**
   * Handle incoming ACK packet
   */
  static async handleACK(packet: MessagePacket): Promise<void> {
    try {
      const originalMessageId = packet.id.replace('ack-', '');
      await SQLiteService.markMessageDelivered(originalMessageId);

      const handler = this.ackHandlers.get(originalMessageId);
      if (handler) {
        handler();
      }

      console.log(`✓ ACK received: ${originalMessageId}`);
    } catch (error) {
      console.error('Handle ACK failed:', error);
    }
  }

  /**
   * Send READ packet (blue tick - read)
   */
  static async sendREAD(
    fromAlias: string,
    toAlias: string,
    messageId: string
  ): Promise<void> {
    try {
      const readPacket: MessagePacket = {
        id: `read-${messageId}`,
        from: fromAlias,
        to: toAlias,
        timestamp: Date.now(),
        type: MessageType.READ,
      };

      await WebRTCService.sendMessage(toAlias, readPacket);
      console.log(`✓ READ sent for message: ${messageId}`);
    } catch (error) {
      console.error('Send READ failed:', error);
    }
  }

  /**
   * Handle incoming READ packet
   */
  static async handleREAD(packet: MessagePacket): Promise<void> {
    try {
      const originalMessageId = packet.id.replace('read-', '');
      await SQLiteService.markMessageRead(originalMessageId);

      const handler = this.readHandlers.get(originalMessageId);
      if (handler) {
        handler();
      }

      console.log(`✓ READ received: ${originalMessageId}`);
    } catch (error) {
      console.error('Handle READ failed:', error);
    }
  }

  /**
   * Flush pending messages when peer comes online
   */
  static async flushPendingMessages(peerAlias: string): Promise<void> {
    try {
      const pending = await SQLiteService.getPendingMessages();
      const peerMessages = pending.filter(msg => msg.to === peerAlias);

      for (const msg of peerMessages) {
        try {
          await WebRTCService.sendMessage(peerAlias, {
            id: msg.id,
            from: 'self', // Will be set by sender
            to: peerAlias,
            content: msg.content,
            encryptedContent: msg.encryptedContent,
            timestamp: msg.createdAt,
            type: MessageType.TEXT,
          });

          // Remove from pending queue
          await SQLiteService.removePendingMessage(msg.id);
          console.log(`✓ Pending message sent: ${msg.id}`);
        } catch (error) {
          console.error(`Failed to send pending message ${msg.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Flush pending messages failed:', error);
    }
  }

  /**
   * Register a handler for incoming messages from a peer
   */
  static onMessage(peerAlias: string, handler: (message: Message) => void): () => void {
    this.messageHandlers.set(peerAlias, handler);

    // Return cleanup function
    return () => {
      this.messageHandlers.delete(peerAlias);
    };
  }

  /**
   * Register a handler for message ACK
   */
  static onACK(messageId: string, handler: () => void): () => void {
    this.ackHandlers.set(messageId, handler);

    return () => {
      this.ackHandlers.delete(messageId);
    };
  }

  /**
   * Register a handler for message READ
   */
  static onREAD(messageId: string, handler: () => void): () => void {
    this.readHandlers.set(messageId, handler);

    return () => {
      this.readHandlers.delete(messageId);
    };
  }

  /**
   * Get chat history with a peer
   */
  static async getChatHistory(
    userAlias: string,
    peerAlias: string,
    limit: number = 50
  ): Promise<Message[]> {
    return SQLiteService.getMessageHistory(userAlias, peerAlias, limit);
  }
}
