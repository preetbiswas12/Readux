/**
 * Project Aegis - Type Definitions
 * Central type definitions for the P2P chat application
 */

export interface User {
  alias: string; // @username
  publicKey: string; // SEA public key
  privateKey: string; // SEA private key (never transmitted)
  seed: string; // BIP-39 12-word recovery phrase
  createdAt: number; // Timestamp when account was created
}

export interface Message {
  id: string; // UUID
  from: string; // Sender's public key
  to: string; // Recipient's public key
  content: string; // Encrypted message content
  timestamp: number; // Local timestamp (Lamport if skewed)
  type: 'text' | 'ack' | 'read'; // Message type
  encrypted: boolean; // Is content encrypted?
  delivered?: boolean; // Double tick
  read?: boolean; // Blue tick
}

export interface Contact {
  alias: string;
  publicKey: string;
  lastSeen?: number;
  isOnline?: boolean; // From GunDB presence
}

export interface PendingMessage {
  id: string;
  to: string;
  content: string;
  encryptedContent: string;
  createdAt: number;
  retries: number;
}

export interface GroupChat {
  id: string;
  name: string;
  members: string[]; // Array of public keys
  createdAt: number;
  createdBy: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  from: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

export interface CryptoKeys {
  publicKey: string;
  privateKey: string;
}

export interface GunDBConfig {
  mainRelay: string; // gun.eco
  fallbackRelays: string[]; // dweb.link, other public relays
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser?: User;
  isOnline: boolean;
  batteryMode: 'always' | 'saver'; // Always online or battery saver
}
