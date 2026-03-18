/**
 * Project Aegis - Message Service
 * Handles message encryption, sending, receiving, and delivery tracking
 */

import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';
import { CryptoService } from './CryptoService';
import { SQLiteService } from './SQLiteService';
import WebRTCService from './WebRTCService';
// @ts-ignore - E2EEncryptionService is default exported as singleton
import E2EEncryptionService, { type EncryptedMessagePacket } from './E2EEncryptionService';

export enum MessageType {
  TEXT = 'text',
  ACK = 'ack',
  READ = 'read',
}

interface MessagePacket {
  id: string;
  from: string;
  to: string;
  content?: string; // For text messages (deprecated: use encrypted packets)
  encryptedContent?: string; // Deprecated
  ciphertext?: string; // E2EE ciphertext (new)
  nonce?: string;
  header?: string; // E2EE header (new)
  timestamp: number;
  type: MessageType;
  counter?: number; // E2EE ratchet counter
  dhr?: string; // DH ratchet key for PFS
}

export class MessageService {
  private static messageHandlers: Map<string, (message: Message) => void> = new Map();
  private static ackHandlers: Map<string, () => void> = new Map();
  private static readHandlers: Map<string, () => void> = new Map();
  private static encryptionSessions: Set<string> = new Set(); // Tracks which peers have encryption initialized

  /**
   * Send a text message to a peer (E2EE with Double Ratchet)
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
      // Ensure encryption session is initialized
      if (!this.encryptionSessions.has(toAlias)) {
        await this.initializeEncryption(fromAlias, toAlias, recipientPublicKey);
      }

      // Encrypt message using Double Ratchet E2EE
      const encrypted = await E2EEncryptionService.encryptMessage(
        toAlias,
        content
      );

      // Create full packet with encryption metadata
      const packet: MessagePacket = {
        id: messageId,
        from: fromAlias,
        to: toAlias,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        header: encrypted.header,
        timestamp: encrypted.timestamp,
        counter: encrypted.counter,
        dhr: encrypted.dhr,
        type: MessageType.TEXT,
      };

      // Try to send via WebRTC if connected
      const sent = await WebRTCService.sendMessage(toAlias, packet);

      // Always save to local history (plaintext in local DB for user)
      const message: Message = {
        id: messageId,
        from: fromAlias,
        to: toAlias,
        content,
        timestamp: packet.timestamp,
        type: 'text',
        encrypted: true, // Marked as E2EE
        delivered: sent,
        read: false,
      };

      await SQLiteService.saveMessage(message);

      // If not sent via WebRTC, queue for later delivery
      if (!sent) {
        await SQLiteService.addPendingMessage(
          toAlias,
          content,
          packet.ciphertext || ''
        );
        console.log(`📌 E2EE Message queued (offline): ${messageId}`);
      } else {
        console.log(`✓ E2EE Message sent: ${messageId}`);
      }

      return messageId;
    } catch (error) {
      console.error('Send E2EE message failed:', error);
      throw error;
    }
  }

  /**
   * Initialize E2EE Double Ratchet session with a peer
   */
  private static async initializeEncryption(
    fromAlias: string,
    toAlias: string,
    recipientPublicKey: string
  ): Promise<void> {
    try {
      // Generate ephemeral keypair for this conversation
      const ephemeralKeypair = CryptoService.generateEphemeralKeypair();
      
      // Perform ECDH key exchange
      const sharedSecretHex = CryptoService.performECDH(
        ephemeralKeypair.privateKey,
        recipientPublicKey
      );

      // Convert hex to Uint8Array for E2EEncryptionService
      const sharedSecret = new Uint8Array(
        Buffer.from(sharedSecretHex, 'hex')
      );

      // Initialize encryption session with shared secret
      await E2EEncryptionService.initializeSession(
        toAlias,
        sharedSecret,
        true // We are initiator
      );

      this.encryptionSessions.add(toAlias);
      console.log(`🔐 E2EE session initialized with @${toAlias}`);
    } catch (error) {
      console.error(
        `Failed to initialize E2EE with @${toAlias}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle incoming message packet from peer (E2EE decryption)
   */
  static async handleIncomingMessage(packet: MessagePacket): Promise<void> {
    try {
      let decryptedContent: string;

      // Check if message is E2EE encrypted (new format)
      if (packet.ciphertext && packet.header) {
        // Initialize encryption session if needed
        if (!this.encryptionSessions.has(packet.from)) {
          // This is first message from this peer - we receive as non-initiator
          // Key exchange happens via out-of-band (e.g., first WebRTC connection init)
          // For now, mark session as initialized with first message
          this.encryptionSessions.add(packet.from);
        }

        // Decrypt using Double Ratchet
        try {
          const encryptedPacket: EncryptedMessagePacket = {
            id: packet.id,
            from: packet.from,
            to: packet.to!,
            ciphertext: packet.ciphertext,
            nonce: packet.nonce || '',
            header: packet.header,
            timestamp: packet.timestamp,
            counter: packet.counter || 0,
            dhr: packet.dhr,
          };

          decryptedContent = await E2EEncryptionService.decryptMessage(
            packet.from,
            encryptedPacket
          );
        } catch (error) {
          console.error(`E2EE decryption failed from @${packet.from}: ${error}`);
          throw error;
        }
      } else {
        // Fallback to old encryption (basic)
        decryptedContent = CryptoService.decryptMessage(
          packet.encryptedContent || '',
          packet.content || ''
        );
      }

      const message: Message = {
        id: packet.id,
        from: packet.from,
        to: packet.to!,
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
      await this.sendACK(packet.to!, packet.from, packet.id);

      // Trigger message handler
      const handler = this.messageHandlers.get(packet.from);
      if (handler) {
        handler(message);
      }

      console.log(`💬 E2EE Message received: ${packet.id} from @${packet.from}`);
    } catch (error) {
      console.error('Handle incoming E2EE message failed:', error);
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
   * End encryption session with a peer
   */
  static endEncryptionSession(peerAlias: string): void {
    if (this.encryptionSessions.has(peerAlias)) {
      E2EEncryptionService.endSession(peerAlias);
      this.encryptionSessions.delete(peerAlias);
      console.log(`🔐 E2EE session ended with @${peerAlias}`);
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
