/**
 * SQLite Local Database Service
 * Manages chat history, pending messages, user profiles, and encryption keys
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export interface Message {
  id: string;
  senderId: string;
  senderAlias: string;
  recipientId: string;
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'pending';
  createdAt: number;
}

export interface User {
  id: string;
  alias: string;
  publicKey: string;
  isContact: boolean;
  lastInteraction: number;
}

export interface PendingMessage {
  id: string;
  recipientId: string;
  content: string;
  encryptedContent: string;
  createdAt: number;
  retryCount: number;
}

/**
 * Initialize SQLite database
 */
export const initializeDatabase = async (userId: string): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(`aegis_${userId}.db`);
    
    // Create tables if they don't exist
    await createTables();
    
    console.log('[SQLite] Database initialized for user:', userId);
  } catch (error) {
    console.error('[SQLite] Initialization failed:', error);
    throw error;
  }
};

/**
 * Create database tables
 */
const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Messages table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT NOT NULL,
        senderAlias TEXT NOT NULL,
        recipientId TEXT NOT NULL,
        content TEXT NOT NULL,
        encryptedContent TEXT,
        timestamp INTEGER,
        status TEXT DEFAULT 'pending',
        createdAt INTEGER NOT NULL
      );
    `);

    // Pending messages queue
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pendingMessages (
        id TEXT PRIMARY KEY,
        recipientId TEXT NOT NULL,
        content TEXT NOT NULL,
        encryptedContent TEXT,
        createdAt INTEGER NOT NULL,
        retryCount INTEGER DEFAULT 0
      );
    `);

    // Users/Contacts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        alias TEXT UNIQUE NOT NULL,
        publicKey TEXT NOT NULL,
        isContact INTEGER DEFAULT 0,
        lastInteraction INTEGER
      );
    `);

    // User identity table (singleton)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS userIdentity (
        id TEXT PRIMARY KEY,
        alias TEXT NOT NULL,
        publicKey TEXT NOT NULL,
        privateKey TEXT NOT NULL,
        seedPhrase TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);

    console.log('[SQLite] Tables created successfully');
  } catch (error) {
    console.error('[SQLite] Table creation failed:', error);
    throw error;
  }
};

/**
 * Save user identity locally (encrypted seed phrase)
 */
export const saveUserIdentity = async (
  id: string,
  alias: string,
  publicKey: string,
  privateKey: string,
  seedPhrase: string
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO userIdentity (id, alias, publicKey, privateKey, seedPhrase, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, alias, publicKey, privateKey, seedPhrase, Date.now()]
    );
    
    console.log('[SQLite] User identity saved');
  } catch (error) {
    console.error('[SQLite] Save identity failed:', error);
    throw error;
  }
};

/**
 * Get stored user identity
 */
export const getUserIdentity = async (): Promise<any | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM userIdentity LIMIT 1'
    );
    return result || null;
  } catch (error) {
    console.error('[SQLite] Get identity failed:', error);
    throw error;
  }
};

/**
 * Insert a message into chat history
 */
export const saveMessage = async (message: Message): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync(
      `INSERT INTO messages (id, senderId, senderAlias, recipientId, content, timestamp, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.senderId,
        message.senderAlias,
        message.recipientId,
        message.content,
        message.timestamp,
        message.status,
        message.createdAt,
      ]
    );
    
    console.log('[SQLite] Message saved:', message.id);
  } catch (error) {
    console.error('[SQLite] Save message failed:', error);
    throw error;
  }
};

/**
 * Get chat history with a specific user
 */
export const getChatHistory = async (
  otherUserId: string,
  limit: number = 50
): Promise<Message[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const messages = await db.getAllAsync<Message>(
      `SELECT * FROM messages 
       WHERE (senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?)
       ORDER BY createdAt DESC
       LIMIT ?`,
      [otherUserId, otherUserId, otherUserId, otherUserId, limit]
    );
    
    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('[SQLite] Get chat history failed:', error);
    throw error;
  }
};

/**
 * Add message to pending queue (offline)
 */
export const addPendingMessage = async (
  recipientId: string,
  content: string,
  encryptedContent: string
): Promise<string> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const id = Math.random().toString(36).substring(7);
    
    await db.runAsync(
      `INSERT INTO pendingMessages (id, recipientId, content, encryptedContent, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [id, recipientId, content, encryptedContent, Date.now()]
    );
    
    console.log('[SQLite] Message added to pending queue:', id);
    return id;
  } catch (error) {
    console.error('[SQLite] Add pending failed:', error);
    throw error;
  }
};

/**
 * Get all pending messages
 */
export const getPendingMessages = async (): Promise<PendingMessage[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllAsync<PendingMessage>(
      'SELECT * FROM pendingMessages ORDER BY createdAt ASC'
    );
  } catch (error) {
    console.error('[SQLite] Get pending messages failed:', error);
    throw error;
  }
};

/**
 * Remove pending message (after successful send)
 */
export const removePendingMessage = async (messageId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync('DELETE FROM pendingMessages WHERE id = ?', [messageId]);
    console.log('[SQLite] Pending message cleared:', messageId);
  } catch (error) {
    console.error('[SQLite] Remove pending failed:', error);
    throw error;
  }
};

/**
 * Save or update contact
 */
export const saveContact = async (
  id: string,
  alias: string,
  publicKey: string
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO users (id, alias, publicKey, isContact, lastInteraction)
       VALUES (?, ?, ?, 1, ?)`,
      [id, alias, publicKey, Date.now()]
    );
    
    console.log('[SQLite] Contact saved:', alias);
  } catch (error) {
    console.error('[SQLite] Save contact failed:', error);
    throw error;
  }
};

/**
 * Get all contacts
 */
export const getContacts = async (): Promise<User[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllAsync<User>(
      'SELECT * FROM users WHERE isContact = 1 ORDER BY lastInteraction DESC'
    );
  } catch (error) {
    console.error('[SQLite] Get contacts failed:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('[SQLite] Database closed');
  }
};
