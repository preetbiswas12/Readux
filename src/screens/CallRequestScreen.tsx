import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../contexts/AppContext';

interface CallRequestScreenProps {
  onAccept: (callType: 'audio' | 'video') => void;
  onReject: () => void;
}

/**
 * CallRequestScreen displays incoming call notifications
 *
 * Features:
 * - Caller name and call type (audio/video)
 * - Accept/Reject buttons
 * - Ringtone animation (pulsing effect)
 * - Call badges (audio🎤 / video📹)
 */
export const CallRequestScreen: React.FC<CallRequestScreenProps> = ({
  onAccept,
  onReject,
}) => {
  const {incomingCallRequest} = useApp();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pulsing ringtone effect
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [scaleAnim]);

  if (!incomingCallRequest) {
    return null;
  }

  const handleAcceptAudio = () => {
    onAccept('audio');
  };

  const handleAcceptVideo = () => {
    onAccept('video');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Caller Info */}
        <Animated.View style={{transform: [{scale: scaleAnim}]}}>
          <View style={styles.callerCard}>
            <Text style={styles.callTypeEmoji}>
              {incomingCallRequest.type === 'video' ? '📹' : '🎤'}
            </Text>
            <Text style={styles.callerName}>{incomingCallRequest.from}</Text>
            <Text style={styles.callTypeText}>
              {incomingCallRequest.type === 'video' ? 'Video Call' : 'Audio Call'}
            </Text>
          </View>
        </Animated.View>

        {/* Call Time */}
        <Text style={styles.callTimeText}>Incoming...</Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Reject Button */}
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Text style={styles.actionIcon}>☎️</Text>
            <Text style={styles.actionLabel}>Reject</Text>
          </TouchableOpacity>

          {/* Accept Audio Button */}
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptAudio}>
            <Text style={styles.actionIcon}>🎤</Text>
            <Text style={styles.actionLabel}>Audio</Text>
          </TouchableOpacity>

          {/* Accept Video Button (only if caller requested video) */}
          {incomingCallRequest.type === 'video' && (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptVideo}>
              <Text style={styles.actionIcon}>📹</Text>
              <Text style={styles.actionLabel}>Video</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  callerCard: {
    backgroundColor: '#262626',
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#404040',
  },
  callTypeEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  callTypeText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  callTimeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 60,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  rejectButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CallRequestScreen;
