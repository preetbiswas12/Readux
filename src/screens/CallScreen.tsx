import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
// @ts-ignore - Importing service singleton instance
import CallService from '../services/CallService';
import { type CallState } from '../services/CallService';
import {useApp} from '../contexts/AppContext';

interface CallScreenProps {
  peerAlias: string;
  callType: 'audio' | 'video';
  onEndCall: () => void;
}

/**
 * CallScreen displays an active audio/video call
 *
 * Features:
 * - Local video (picture-in-picture) / Local audio indicator
 * - Remote video (fullscreen)
 * - Call timer (elapsed duration)
 * - Call controls (end, mute, camera toggle)
 * - Connection status badge
 * - Audio/video permission status
 *
 * State Management:
 * - Listens to call service for state changes
 * - Tracks stream setup (waiting for both streams)
 * - Monitors WebRTC connection state
 */
export const CallScreen: React.FC<CallScreenProps> = ({
  peerAlias,
  callType: initialCallType,
  onEndCall,
}) => {
  const {appState} = useApp();
  const [callState, setCallState] = useState<CallState>('active');
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callType] = useState(initialCallType);
  const callDurationIntervalRef = useRef<any>(null);

  // Subscribe to call state changes
  useEffect(() => {
    const handleCallStateChange = (state: CallState) => {
      setCallState(state);
      if (state === 'ended') {
        void handleEndCall();
      }
    };

    CallService.onCallStateChange(peerAlias, handleCallStateChange);
  }, [peerAlias]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup call duration timer
  useEffect(() => {
    callDurationIntervalRef.current = setInterval(() => {
      const duration = CallService.getCallDuration(peerAlias);
      setCallDuration(duration);
    }, 1000);

    return () => {
      if (callDurationIntervalRef.current) {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current as any);
      }
      }
    };
  }, [peerAlias]);

  // Monitor streams
  useEffect(() => {
    const session = CallService.getCallSession(peerAlias);
    if (session) {
      setLocalStream(session.localStream || null);
      setRemoteStream(session.remoteStream || null);
      setIsLoading(!session.localStream); // Wait for local stream to be ready
    }
  }, [peerAlias]);

  // Handle end call
  const handleEndCall = async () => {
    if (callDurationIntervalRef.current) {
      clearInterval(callDurationIntervalRef.current);
    }
    await CallService.endCall(peerAlias);
    onEndCall();
  };

  // Toggle audio mute
  const handleToggleMute = async () => {
    const session = CallService.getCallSession(peerAlias);
    if (session?.localStream) {
      const audioTracks = session.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted; // Toggle
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle camera
  const handleToggleCamera = async () => {
    const session = CallService.getCallSession(peerAlias);
    if (session?.localStream) {
      const videoTracks = session.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isCameraOff; // Toggle
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Stream (Main Display) */}
      {callType === 'video' && remoteStream ? (
        <RTCView
          streamURL={remoteStream?.toURL?.() || ''}
          style={styles.remoteStream}
          objectFit="cover"
        />
      ) : (
        <View style={styles.audioCallContainer}>
          <View style={styles.audioPlaceholder}>
            <Text style={styles.audioPlaceholderEmoji}>🎤</Text>
            <Text style={styles.audioPlaceholderText}>{peerAlias}</Text>
            <Text style={styles.audioPlaceholderSubtext}>Audio Call Active</Text>
          </View>
        </View>
      )}

      {/* Local Stream (Picture-in-Picture) */}
      {callType === 'video' && localStream && !isCameraOff && (
        <RTCView
            streamURL={localStream?.toURL?.() || ''}
          style={styles.localStream}
          objectFit="cover"
        />
      )}

      {/* Call Info Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.callInfo}>
            <Text style={styles.peerName}>{peerAlias}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: appState.isOnline ? '#4ade80' : '#9ca3af'},
                ]}
              />
              <Text style={styles.statusText}>
                {appState.isOnline ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
        </View>

        {/* Call Controls */}
        <View style={styles.controls}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <Text style={styles.controlButtonIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            <Text style={styles.controlButtonLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* Camera Toggle (Video only) */}
          {callType === 'video' && (
            <TouchableOpacity
              style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
              onPress={handleToggleCamera}
            >
              <Text style={styles.controlButtonIcon}>{isCameraOff ? '📷' : '📹'}</Text>
              <Text style={styles.controlButtonLabel}>{isCameraOff ? 'Camera Off' : 'Camera On'}</Text>
            </TouchableOpacity>
          )}

          {/* End Call Button */}
          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={handleEndCall}>
            <Text style={styles.controlButtonIcon}>☎️</Text>
            <Text style={styles.controlButtonLabel}>End Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Connecting to {peerAlias}...</Text>
        </View>
      )}

      {/* Call Ended Overlay */}
      {callState === 'ended' && (
        <View style={styles.endedOverlay}>
          <Text style={styles.endedText}>Call Ended</Text>
          <Text style={styles.endedDuration}>Duration: {formatDuration(callDuration)}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteStream: {
    flex: 1,
  },
  localStream: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  audioCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  audioPlaceholder: {
    alignItems: 'center',
  },
  audioPlaceholderEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  audioPlaceholderText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  audioPlaceholderSubtext: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callInfo: {},
  peerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  duration: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#404040',
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
  },
  controlButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlButtonLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  endCallButton: {
    backgroundColor: '#dc2626',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  endedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  endedText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  endedDuration: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default CallScreen;
