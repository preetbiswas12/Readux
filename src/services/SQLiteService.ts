/**
 * Project Aegis - SQLite Service
 * Local database for chat history, messages, and pending queue
 */

import * as SQLite from 'expo-sqlite';
import type { Message, PendingMessage } from '../types';

export class SQLiteService {
  private static db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize SQLite database with schema
   */
  static async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('aegis.db');
      console.log('✓ SQLite database opened');

      // Create tables
      await this.createTables();
    } catch (error) {
      console.error('SQLite initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private static async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Messages table (chat history)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        from_alias TEXT NOT NULL,
        to_alias TEXT NOT NULL,
        content TEXT NOT NULL,
        encrypted_content TEXT,
        timestamp INTEGER NOT NULL,
        delivered INTEGER DEFAULT 0,
        read INTEGER DEFAULT 0,
        message_type TEXT DEFAULT 'text'
      );
      
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_messages_to_alias ON messages(to_alias);
    `);

    // Pending messages queue (offline)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_messages (
        id TEXT PRIMARY KEY,
        to_alias TEXT NOT NULL,
        content TEXT NOT NULL,
        encrypted_content TEXT,
        created_at INTEGER NOT NULL,
        retries INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 5
      );
    `);

    // Contacts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        alias TEXT PRIMARY KEY,
        public_key TEXT NOT NULL,
        last_seen INTEGER,
        is_blocked INTEGER DEFAULT 0
      );
    `);

    // Group chats (full-mesh)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS group_chats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        members TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        created_by TEXT NOT NULL
      );
    `);

    // Group messages
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        from_alias TEXT NOT NULL,
        content TEXT NOT NULL,
        encrypted_content TEXT,
        timestamp INTEGER NOT NULL,
        message_type TEXT DEFAULT 'text',
        FOREIGN KEY(group_id) REFERENCES group_chats(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
    `);

    // App state (user identity, preferences)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    console.log('✓ All database tables created');
  }

  /**
   * Save a message to local history
   */
  static async saveMessage(message: Message): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO messages (id, from_alias, to_alias, content, encrypted_content, timestamp, delivered, read, message_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.from,
          message.to,
          message.content,
          message.content, // For now, store content without encryption
          message.timestamp,
          message.delivered ? 1 : 0,
          message.read ? 1 : 0,
          message.type,
        ]
      );

      console.log(`✓ Message saved: ${message.id}`);
    } catch (error) {
      console.error('Save message failed:', error);
      throw error;
    }
  }

  /**
   * Get chat history with a specific user
   */
  static async getMessageHistory(
    userAlias: string,
    peerAlias: string,
    limit: number = 50
  ): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const rows = await this.db.getAllAsync(
        `SELECT * FROM messages 
         WHERE (from_alias = ? AND to_alias = ?) OR (from_alias = ? AND to_alias = ?)
         ORDER BY timestamp DESC
         LIMIT ?`,
        [userAlias, peerAlias, peerAlias, userAlias, limit]
      );

      return (rows as any[]).map(row => ({
        id: row.id,
        from: row.from_alias,
        to: row.to_alias,
        content: row.content,
        timestamp: row.timestamp,
        type: row.message_type as any,
        encrypted: !!row.encrypted_content,
        delivered: row.delivered === 1,
        read: row.read === 1,
      }));
    } catch (error) {
      console.error('Get message history failed:', error);
      return [];
    }
  }

  /**
   * Add a message to pending queue (offline)
   */
  static async addPendingMessage(
    toAlias: string,
    content: string,
    encryptedContent: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `pending-${Date.now()}-${Math.random()}`;

    try {
      await this.db.runAsync(
        `INSERT INTO pending_messages (id, to_alias, content, encrypted_content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, toAlias, content, encryptedContent, Date.now()]
      );

      console.log(`✓ Pending message queued: ${id}`);
      return id;
    } catch (error) {
      console.error('Add pending message failed:', error);
      throw error;
    }
  }

  /**
   * Get all pending messages
   */
  static async getPendingMessages(): Promise<PendingMessage[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const rows = await this.db.getAllAsync(
        `SELECT * FROM pending_messages WHERE retries < max_retries`
      );

      return (rows as any[]).map(row => ({
        id: row.id,
        to: row.to_alias,
        content: row.content,
        encryptedContent: row.encrypted_content,
        createdAt: row.created_at,
        retries: row.retries,
      }));
    } catch (error) {
      console.error('Get pending messages failed:', error);
      return [];
    }
  }

  /**
   * Remove a pending message after successful send
   */
  static async removePendingMessage(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`DELETE FROM pending_messages WHERE id = ?`, [id]);
      console.log(`✓ Pending message removed: ${id}`);
    } catch (error) {
      console.error('Remove pending message failed:', error);
    }
  }

  /**
   * Save app state (user identity, preferences)
   */
  static async saveAppState(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)`,
        [key, value]
      );

      console.log(`✓ App state saved: ${key}`);
    } catch (error) {
      console.error('Save app state failed:', error);
    }
  }

  /**
   * Load app state
   */
  static async loadAppState(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const row = await this.db.getFirstAsync(
        `SELECT value FROM app_state WHERE key = ?`,
        [key]
      );

      return (row as any)?.value || null;
    } catch (error) {
      console.error('Load app state failed:', error);
      return null;
    }
  }

  /**
   * Mark message as delivered (double tick)
   */
  static async markMessageDelivered(messageId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE messages SET delivered = 1 WHERE id = ?`,
        [messageId]
      );
    } catch (error) {
      console.error('Mark delivered failed:', error);
    }
  }

  /**
   * Mark message as read (blue tick)
   */
  static async markMessageRead(messageId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE messages SET read = 1 WHERE id = ?`,
        [messageId]
      );
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  }

  /**
   * Get all messages for a user (sent + received)
   */
  static async getAllMessages(userAlias: string): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync<any>(
        `SELECT * FROM messages WHERE from_alias = ? OR to_alias = ? ORDER BY timestamp DESC`,
        [userAlias, userAlias]
      );

      return result.map(row => ({
        id: row.id,
        from: row.from_alias,
        to: row.to_alias,
        content: row.content,
        timestamp: row.timestamp,
        type: 'text',
        encrypted: true,
        delivered: row.delivered === 1,
        read: row.read === 1,
      }));
    } catch (error) {
      console.error('Get all messages failed:', error);
      return [];
    }
  }

  /**
   * Get messages since a specific timestamp (for incremental sync)
   */
  static async getMessagesSince(userAlias: string, timestamp: number): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync<any>(
        `SELECT * FROM messages WHERE (from_alias = ? OR to_alias = ?) AND timestamp > ? ORDER BY timestamp DESC`,
        [userAlias, userAlias, timestamp]
      );

      return result.map(row => ({
        id: row.id,
        from: row.from_alias,
        to: row.to_alias,
        content: row.content,
        timestamp: row.timestamp,
        type: 'text',
        encrypted: true,
        delivered: row.delivered === 1,
        read: row.read === 1,
      }));
    } catch (error) {
      console.error('Get messages since failed:', error);
      return [];
    }
  }

  /**
   * Get all contacts
   */
  static async getAllContacts(): Promise<Array<{ alias: string; publicKey: string; timestamp?: number }>> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync<any>(
        `SELECT alias, public_key, last_seen FROM contacts WHERE is_blocked = 0 ORDER BY alias`
      );

      return result.map(row => ({
        alias: row.alias,
        publicKey: row.public_key,
        timestamp: row.last_seen,
      }));
    } catch (error) {
      console.error('Get all contacts failed:', error);
      return [];
    }
  }

  /**
   * Add or update a contact
   */
  static async addContact(alias: string, publicKey: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO contacts (alias, public_key, last_seen) VALUES (?, ?, ?)`,
        [alias, publicKey, Date.now()]
      );
    } catch (error) {
      console.error('Add contact failed:', error);
    }
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('✓ SQLite database closed');
    }
  }
}
