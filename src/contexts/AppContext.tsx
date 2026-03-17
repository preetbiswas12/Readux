/**
 * Project Aegis - App Context
 * Manages global app state (user, online status, etc.)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AppState as AppStateType } from '../types';
import { StorageService } from '../services/StorageService';
import { SQLiteService } from '../services/SQLiteService';
import { GunDBService } from '../services/gundbService';
import { CryptoService } from '../services/CryptoService';
import WebRTCService from '../services/WebRTCService';
import { MessageService } from '../services/MessageService';
// @ts-ignore - BackgroundService is default exported as singleton
import BackgroundService from '../services/BackgroundService';
// @ts-ignore - TURNFallbackService is default exported as singleton
import TURNFallbackService from '../services/TURNFallbackService';
// @ts-ignore - FileTransferService is default exported as singleton
import FileTransferService from '../services/FileTransferService';
// @ts-ignore - CallService is default exported as singleton
import CallService, { type CallRequest, type CallSession } from '../services/CallService';
// @ts-ignore - SyncService is default exported as singleton
import SyncService from '../services/SyncService';

interface AppContextType {
  appState: AppStateType;
  currentUser: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  
  // Call management
  incomingCallRequest: CallRequest | null;
  currentCallPeer: string | null;
  
  // Auth actions
  signup: (alias: string) => Promise<{ user: User; seed: string }>;
  login: (seed: string) => Promise<User>;
  logout: () => Promise<void>;
  
  // Status
  setOnline: (online: boolean) => Promise<void>;
  setBatteryMode: (mode: 'always' | 'saver') => void;
  
  // Peer management
  connectToPeer: (peerAlias: string) => Promise<void>;
  
  // Call management
  initiateCall: (peerAlias: string, callType: 'audio' | 'video') => Promise<CallSession>;
  acceptCall: (peerAlias: string, callType: 'audio' | 'video') => Promise<CallSession>;
  rejectCall: (peerAlias: string) => Promise<void>;
  endCall: (peerAlias: string) => Promise<void>;

  // File transfer
  initiateFileTransfer: (
    fileBuffer: ArrayBuffer,
    fileName: string,
    mimeType: string,
    recipientAlias: string
  ) => Promise<string>;

  // Multi-device sync
  initiateSync: (deviceName: string, peerAlias: string) => Promise<string>;
  getSyncProgress: (syncId: string) => any;
  getAllSyncs: () => any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppStateType>({
    isLoggedIn: false,
    isOnline: false,
    batteryMode: 'saver',
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [presenceUnsubscribers] = useState<Map<string, () => void>>(new Map());
  
  // Call management state
  const [incomingCallRequest, setIncomingCallRequest] = useState<CallRequest | null>(null);
  const [currentCallPeer, setCurrentCallPeer] = useState<string | null>(null);

  // Initialize app on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize services
        await SQLiteService.initialize();
        await GunDBService.initialize();
        await TURNFallbackService.initialize();

        // Check if user is already logged in
        const user = await StorageService.getUser();
        if (user) {
          setCurrentUser(user);
          setAppState(prev => ({ ...prev, isLoggedIn: true }));
          
          // Enable background listening for recovered user
          await BackgroundService.enableBackgroundListening(user.alias);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const signup = async (alias: string): Promise<{ user: User; seed: string }> => {
    try {
      // Generate BIP-39 seed
      const seed = CryptoService.generateBIP39Seed();

      // Derive keypair from seed
      const { publicKey, privateKey } = await CryptoService.deriveKeypairFromSeed(seed);

      // Create user object
      const user: User = {
        alias,
        publicKey,
        privateKey,
        seed,
        createdAt: Date.now(),
      };

      // Save user to secure storage
      await StorageService.saveSeed(seed);
      await StorageService.saveUser(user);
      await StorageService.savePrivateKey(privateKey);

      // Save to local database
      await SQLiteService.saveAppState('user_alias', alias);
      await SQLiteService.saveAppState('user_public_key', publicKey);

      // Register user in GunDB DHT
      await GunDBService.registerUser(user);

      // Update app state
      setCurrentUser(user);
      setAppState(prev => ({ ...prev, isLoggedIn: true }));

      // Enable background listening for incoming messages and calls
      await BackgroundService.enableBackgroundListening(user.alias);

      console.log(`✓ Signup complete: @${alias}`);

      return { user, seed };
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const login = async (seed: string): Promise<User> => {
    try {
      // Validate seed
      if (!CryptoService.isValidBIP39Seed(seed)) {
        throw new Error('Invalid recovery seed phrase');
      }

      // Derive keypair from seed
      const { publicKey, privateKey } = await CryptoService.deriveKeypairFromSeed(seed);

      // Load user alias from previous login (or ask user)
      const savedAlias = await SQLiteService.loadAppState('user_alias');

      if (!savedAlias) {
        throw new Error('No saved user found. Please sign up first.');
      }

      const user: User = {
        alias: savedAlias,
        publicKey,
        privateKey,
        seed,
        createdAt: Date.now(),
      };

      // Save to secure storage
      await StorageService.saveUser(user);
      await StorageService.savePrivateKey(privateKey);

      // Update app state
      setCurrentUser(user);
      setAppState(prev => ({ ...prev, isLoggedIn: true }));

      // Enable background listening for incoming messages and calls
      await BackgroundService.enableBackgroundListening(user.alias);

      console.log(`✓ Login complete: @${user.alias}`);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
        // Publish offline status
        await GunDBService.publishPresence(currentUser.alias, false);
        
        // Cleanup all presence subscriptions
        presenceUnsubscribers.forEach(unsub => unsub());
        presenceUnsubscribers.clear();

        // Disable background listening
        await BackgroundService.disableBackgroundListening();
      }

      // Clear secure storage
      await StorageService.clear();

      // Reset state
      setCurrentUser(null);
      setAppState(prev => ({ ...prev, isLoggedIn: false, isOnline: false }));

      console.log('✓ Logout complete');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const setOnline = async (online: boolean) => {
    if (currentUser) {
      await GunDBService.publishPresence(currentUser.alias, online);
      setAppState(prev => ({ ...prev, isOnline: online }));
    }
  };

  const setBatteryMode = (mode: 'always' | 'saver') => {
    setAppState(prev => ({ ...prev, batteryMode: mode }));
  };

  /**
   * Establish WebRTC connection with a peer
   * Triggered when peer comes online (from GunDB presence)
   */
  const connectToPeer = async (peerAlias: string) => {
    try {
      if (!currentUser) return;

      // Check if TURN fallback should be used
      const useTURN = await TURNFallbackService.shouldUseTURN();
      if (useTURN) {
        console.log(`🔄 Using TURN fallback for connection with @${peerAlias}`);
        TURNFallbackService.forceTURNMode(true);
      }

      // Create peer connection as initiator
      await WebRTCService.createPeerConnection(peerAlias, true);

      // Create SDP offer
      await WebRTCService.createOffer(peerAlias);

      // TODO: Send offer through GunDB relay to peer
      console.log(`🤝 Initiating connection with @${peerAlias}`);

      // Flush pending messages to this peer
      await MessageService.flushPendingMessages(peerAlias);
    } catch (error) {
      console.error(`Failed to connect to @${peerAlias}:`, error);
    }
  };

  /**
   * Initiate an audio/video call with a peer
   */
  const initiateCall = async (peerAlias: string, callType: 'audio' | 'video'): Promise<CallSession> => {
    try {
      if (!currentUser) throw new Error('Not logged in');
      
      const session = await CallService.initiateCall(peerAlias, callType);
      setCurrentCallPeer(peerAlias);
      
      console.log(`📞 Call initiated with @${peerAlias} (${callType})`);
      return session;
    } catch (error) {
      console.error(`Failed to initiate call with @${peerAlias}:`, error);
      throw error;
    }
  };

  /**
   * Accept an incoming call
   */
  const acceptCall = async (peerAlias: string, callType: 'audio' | 'video'): Promise<CallSession> => {
    try {
      const session = await CallService.acceptCall(peerAlias, callType);
      setCurrentCallPeer(peerAlias);
      setIncomingCallRequest(null);
      
      console.log(`✓ Call accepted with @${peerAlias}`);
      return session;
    } catch (error) {
      console.error(`Failed to accept call:`, error);
      throw error;
    }
  };

  /**
   * Reject an incoming call
   */
  const rejectCall = async (peerAlias: string) => {
    try {
      await CallService.rejectCall(peerAlias);
      setIncomingCallRequest(null);
      
      console.log(`✗ Call rejected from @${peerAlias}`);
    } catch (error) {
      console.error(`Failed to reject call:`, error);
      throw error;
    }
  };

  /**
   * End an active call
   */
  const endCall = async (peerAlias: string) => {
    try {
      await CallService.endCall(peerAlias);
      setCurrentCallPeer(null);
      
      console.log(`☎️ Call ended with @${peerAlias}`);
    } catch (error) {
      console.error(`Failed to end call:`, error);
      throw error;
    }
  };

  /**
   * Initiate a file transfer to a peer
   */
  const initiateFileTransfer = async (
    fileBuffer: ArrayBuffer,
    fileName: string,
    mimeType: string,
    recipientAlias: string
  ): Promise<string> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      // Initiate transfer in FileTransferService
      const metadata = await FileTransferService.initiateTransfer(
        fileBuffer,
        fileName,
        mimeType,
        currentUser.alias,
        recipientAlias
      );

      // Send metadata to peer
      const sentMetadata = await WebRTCService.sendFileMetadata(recipientAlias, metadata);
      if (!sentMetadata) {
        throw new Error('Failed to send file metadata to peer');
      }

      console.log(`📄 File transfer initiated with @${recipientAlias}: ${fileName}`);
      return metadata.fileId;
    } catch (error) {
      console.error(`Failed to initiate file transfer:`, error);
      throw error;
    }
  };

  /**
   * Initiate multi-device synchronization
   */
  const initiateSync = async (deviceName: string, peerAlias: string): Promise<string> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      // Create sync request
      const syncRequest = await SyncService.createSyncRequest(
        currentUser.alias,
        deviceName,
        'full'
      );

      // Connect to peer if not already connected
      await connectToPeer(peerAlias);

      // Send sync request via WebRTC
      const sent = await WebRTCService.sendSyncRequest(peerAlias, syncRequest);
      if (!sent) {
        throw new Error('Failed to send sync request to peer');
      }

      console.log(`📱 Sync initiated with @${peerAlias}: ${syncRequest.syncId}`);
      return syncRequest.syncId;
    } catch (error) {
      console.error('Initiate sync failed:', error);
      throw error;
    }
  };

  /**
   * Get sync progress/state
   */
  const getSyncProgress = (syncId: string) => {
    return SyncService.getSyncState(syncId);
  };

  /**
   * Get all active syncs
   */
  const getAllSyncs = () => {
    return SyncService.getActiveSyncs();
  };
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to incoming call requests
    CallService.onCallRequest((request: CallRequest) => {
      console.log(`📱 Incoming call from @${request.from}`);
      setIncomingCallRequest(request);
    });
  }, [currentUser]);

  const value: AppContextType = {
    appState,
    currentUser,
    isInitialized,
    isLoading,
    incomingCallRequest,
    currentCallPeer,
    signup,
    login,
    logout,
    setOnline,
    setBatteryMode,
    connectToPeer,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    initiateFileTransfer,
    initiateSync,
    getSyncProgress,
    getAllSyncs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
