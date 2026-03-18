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
// eslint-disable-next-line
import BackgroundService from '../services/BackgroundService';
// eslint-disable-next-line
import TURNFallbackService from '../services/TURNFallbackService';
// eslint-disable-next-line
import FileTransferService from '../services/FileTransferService';
import CallService, { type CallRequest, type CallSession } from '../services/CallService';
// @ts-ignore - SyncService is default exported as singleton
import SyncService from '../services/SyncService';
// @ts-ignore - GroupChatService is default exported as singleton
import GroupChatService from '../services/GroupChatService';
// @ts-ignore - PerformanceOptimizationService is default exported as singleton
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';
// @ts-ignore - E2ETestingService is default exported as singleton
import E2ETestingService, { type TestReport } from '../services/E2ETestingService';
// @ts-ignore - E2EEncryptionService is default exported as singleton
import E2EEncryptionService from '../services/E2EEncryptionService';

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

  // Group chat management
  createGroup: (name: string, members: string[], description?: string) => Promise<any>;
  sendGroupMessage: (groupId: string, content: string) => Promise<string>;
  addGroupMember: (groupId: string, memberAlias: string) => Promise<void>;
  removeGroupMember: (groupId: string, memberAlias: string) => Promise<void>;
  getGroupMessages: (groupId: string, limit?: number) => Promise<any[]>;
  getUserGroups: () => Promise<any[]>;
  getGroupState: (groupId: string) => any;

  // Performance optimization
  getConnectionMetrics: (peerAlias: string) => any;
  getQualityRecommendations: (peerAlias: string) => string[];
  getPerformanceStats: () => any;
  getBandwidthHistory: (peerAlias: string) => any[];
  getOptimalCodecs: (peerAlias: string, bandwidth: number) => any;

  // E2E Testing
  runQuickTest: () => Promise<TestReport>;
  runFullTestSuite: () => Promise<TestReport>;
  getCurrentTestReport: () => TestReport | null;
  clearTestResults: () => void;

  // End-to-End Encryption (E2EE)
  getEncryptionStatus: (peerAlias: string) => { isActive: boolean; type: 'message' | 'media' | 'none' };
  getMediaEncryptionStatus: (callSessionId: string) => { isEnabled: boolean; sessionId?: string };
  initiateEncryption: (peerAlias: string) => Promise<void>;
  getSessionState: (peerAlias: string) => any;
  isMessageEncryptionEnabled: (peerAlias: string) => boolean;
  isMediaEncryptionEnabled: (callSessionId: string) => boolean;
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
      const offer = await WebRTCService.createOffer(peerAlias);

      // Send offer through GunDB relay to peer
      const callId = `call-${Date.now()}`;
      await GunDBService.publishSDPOffer(peerAlias, { type: offer.type || 'offer', sdp: offer.sdp }, callId);
      console.log(`🤝 SDP Offer sent to @${peerAlias}`);

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

  /**
   * Create a new group chat
   */
  const createGroup = async (
    name: string,
    members: string[],
    description?: string
  ): Promise<any> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      const group = await GroupChatService.createGroup(
        name,
        members,
        currentUser.alias,
        description
      );

      console.log(`👥 Group created: "${name}"`);
      return group;
    } catch (error) {
      console.error('Create group failed:', error);
      throw error;
    }
  };

  /**
   * Send message to a group (full-mesh P2P delivery to all members)
   */
  const sendGroupMessage = async (groupId: string, content: string): Promise<string> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      const messageId = await GroupChatService.sendGroupMessage(
        groupId,
        currentUser.alias,
        content
      );

      // Broadcast to all group members via WebRTC
      const group = GroupChatService.getGroup(groupId);
      if (group) {
        for (const member of group.members) {
          if (member !== currentUser.alias) {
            // Ensure peer connection exists
            try {
              await connectToPeer(member);
              await WebRTCService.sendGroupMessage(member, {
                id: messageId,
                groupId,
                from: currentUser.alias,
                content,
              });
            } catch (error) {
              console.warn(`Failed to send group message to @${member}:`, error);
            }
          }
        }
      }

      console.log(`💬 Group message sent: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('Send group message failed:', error);
      throw error;
    }
  };

  /**
   * Add member to group
   */
  const addGroupMember = async (groupId: string, memberAlias: string): Promise<void> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      await GroupChatService.addMember(groupId, memberAlias, currentUser.alias);
      console.log(`✓ Added @${memberAlias} to group`);
    } catch (error) {
      console.error('Add group member failed:', error);
      throw error;
    }
  };

  /**
   * Remove member from group
   */
  const removeGroupMember = async (groupId: string, memberAlias: string): Promise<void> => {
    try {
      if (!currentUser) throw new Error('Not logged in');

      await GroupChatService.removeMember(groupId, memberAlias, currentUser.alias);
      console.log(`✓ Removed @${memberAlias} from group`);
    } catch (error) {
      console.error('Remove group member failed:', error);
      throw error;
    }
  };

  /**
   * Get messages from a group
   */
  const getGroupMessages = async (groupId: string, limit: number = 50): Promise<any[]> => {
    try {
      return await GroupChatService.getGroupMessages(groupId, limit);
    } catch (error) {
      console.error('Get group messages failed:', error);
      return [];
    }
  };

  /**
   * Get all groups user is a member of
   */
  const getUserGroups = async (): Promise<any[]> => {
    try {
      if (!currentUser) return [];
      return await GroupChatService.getUserGroups(currentUser.alias);
    } catch (error) {
      console.error('Get user groups failed:', error);
      return [];
    }
  };

  /**
   * Get group state (members, presence, etc.)
   */
  const getGroupState = (groupId: string): any => {
    return GroupChatService.getGroupState(groupId);
  };

  /**
   * Get connection metrics for a peer
   */
  const getConnectionMetrics = (peerAlias: string): any => {
    return PerformanceOptimizationService.getConnectionMetrics(peerAlias);
  };

  /**
   * Get quality recommendations for a peer
   */
  const getQualityRecommendations = (peerAlias: string): string[] => {
    return PerformanceOptimizationService.getQualityRecommendations(peerAlias);
  };

  /**
   * Get performance statistics
   */
  const getPerformanceStats = (): any => {
    return PerformanceOptimizationService.getPerformanceStats();
  };

  /**
   * Get bandwidth history for a peer
   */
  const getBandwidthHistory = (peerAlias: string): any[] => {
    return PerformanceOptimizationService.getBandwidthHistory(peerAlias, 50);
  };

  /**
   * Get optimal codecs for a peer based on bandwidth
   */
  const getOptimalCodecs = (peerAlias: string, bandwidth: number): any => {
    return WebRTCService.selectOptimalCodecs(peerAlias, bandwidth);
  };

  /**
   * Run quick E2E test suite (3 fast tests)
   */
  const runQuickTest = async (): Promise<TestReport> => {
    try {
      const report = await E2ETestingService.runQuickTest();
      console.log(`🧪 Quick test complete: ${report.passed}/${report.totalTests} passed`);
      return report;
    } catch (error) {
      console.error('Quick test failed:', error);
      throw error;
    }
  };

  /**
   * Run full E2E test suite (10 comprehensive tests)
   */
  const runFullTestSuite = async (): Promise<TestReport> => {
    try {
      const report = await E2ETestingService.runFullTestSuite();
      console.log(`🧪 Full test suite complete: ${report.passed}/${report.totalTests} passed (${report.successRate.toFixed(1)}%)`);
      return report;
    } catch (error) {
      console.error('Full test suite failed:', error);
      throw error;
    }
  };

  /**
   * Get current test report
   */
  const getCurrentTestReport = (): TestReport | null => {
    return E2ETestingService.getCurrentReport();
  };

  /**
   * Clear test results
   */
  const clearTestResults = (): void => {
    E2ETestingService.clearResults();
  };

  /**
   * Get encryption status for a peer (message and media)
   */
  const getEncryptionStatus = (peerAlias: string): { isActive: boolean; type: 'message' | 'media' | 'none' } => {
    try {
      const session = E2EEncryptionService.getSessionState(peerAlias);
      if (session) {
        return { isActive: true, type: 'message' };
      }
      return { isActive: false, type: 'none' };
    } catch (error) {
      console.warn(`Failed to get encryption status for @${peerAlias}:`, error);
      return { isActive: false, type: 'none' };
    }
  };

  /**
   * Get media encryption (SRTP) status for a call
   */
  const getMediaEncryptionStatus = (callSessionId: string): { isEnabled: boolean; sessionId?: string } => {
    try {
      return CallService.getMediaEncryptionStatus(callSessionId);
    } catch (error) {
      console.warn(`Failed to get media encryption status for ${callSessionId}:`, error);
      return { isEnabled: false };
    }
  };

  /**
   * Explicitly initiate E2EE session with a peer
   */
  const initiateEncryption = async (peerAlias: string): Promise<void> => {
    try {
      if (!currentUser) throw new Error('Not logged in');
      
      // Get peer's public key from GunDB
      const peerInfo = await GunDBService.searchUser(peerAlias);
      if (!peerInfo || !peerInfo.publicKey) {
        throw new Error(`Could not find peer @${peerAlias}`);
      }

      // Initialize E2EE Double Ratchet session
      await E2EEncryptionService.initializeSession(
        peerAlias,
        new Uint8Array(Buffer.from(peerInfo.publicKey, 'hex')),
        true // We are initiator
      );

      console.log(`🔐 E2EE session initialized with @${peerAlias}`);
    } catch (error) {
      console.error(`Failed to initiate encryption with @${peerAlias}:`, error);
      throw error;
    }
  };

  /**
   * Get full session state for a peer (for debugging)
   */
  const getSessionState = (peerAlias: string): any => {
    try {
      return E2EEncryptionService.getSessionState(peerAlias);
    } catch (error) {
      console.warn(`Failed to get session state for @${peerAlias}:`, error);
      return null;
    }
  };

  /**
   * Check if message encryption is enabled for a peer
   */
  const isMessageEncryptionEnabled = (peerAlias: string): boolean => {
    try {
      const session = E2EEncryptionService.getSessionState(peerAlias);
      return session !== null;
    } catch {
      return false;
    }
  };

  /**
   * Check if media encryption is enabled for a call
   */
  const isMediaEncryptionEnabled = (callSessionId: string): boolean => {
    try {
      const status = CallService.getMediaEncryptionStatus(callSessionId);
      return status.isEnabled;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to incoming call requests
    CallService.onCallRequest((request: CallRequest) => {
      console.log(`📱 Incoming call from @${request.from}`);
      setIncomingCallRequest(request);
    });

    // Subscribe to test completion events (for real-time test progress)
    E2ETestingService.onTestComplete((result) => {
      console.log(`🧪 Test ${result.status}: ${result.name} (${result.duration}ms)`);
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
    createGroup,
    sendGroupMessage,
    addGroupMember,
    removeGroupMember,
    getGroupMessages,
    getUserGroups,
    getGroupState,
    getConnectionMetrics,
    getQualityRecommendations,
    getPerformanceStats,
    getBandwidthHistory,
    getOptimalCodecs,
    runQuickTest,
    runFullTestSuite,
    getCurrentTestReport,
    clearTestResults,
    getEncryptionStatus,
    getMediaEncryptionStatus,
    initiateEncryption,
    getSessionState,
    isMessageEncryptionEnabled,
    isMediaEncryptionEnabled,
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
