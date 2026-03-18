/**
 * AudioVideoService - Audio/Video Capture & Permission Management
 * 
 * Handles microphone and camera access for calls
 * Manages platform-specific permissions (iOS/Android)
 * Provides media stream creation for WebRTC
 */

import { Platform } from 'react-native';

export type MediaPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface MediaTrack {
  trackId: string;
  kind: 'audio' | 'video';
  enabled: boolean;
  label: string;
}

/**
 * AudioVideoService - Singleton for audio/video capture
 */
class AudioVideoService {
  private static instance: AudioVideoService;
  private audioRecording: any = null; // Type would be Audio.Recording from expo-av
  private activeStreams: Map<string, MediaStream> = new Map();

  private constructor() {
    this.initializeAudioSession();
  }

  static getInstance(): AudioVideoService {
    if (!AudioVideoService.instance) {
      AudioVideoService.instance = new AudioVideoService();
    }
    return AudioVideoService.instance;
  }

  /**
   * Initialize audio session for iOS
   */
  private initializeAudioSession(): void {
    if (Platform.OS === 'ios') {
      // iOS-specific audio configuration
      // In a real app, you would use expo-av for audio setup
      console.log('[AudioVideo] iOS audio session initialized');
    }
  }

  /**
   * Request audio permission from user
   * Returns: 'granted' | 'denied' | 'undetermined'
   * Note: In React Native, permissions are typically handled via react-native-permissions
   */
  async requestAudioPermission(): Promise<MediaPermissionStatus> {
    try {
      // In a real implementation, you would use react-native-permissions
      // For now, we assume permission is granted
      console.log('[AudioVideo] Audio permission requested');
      return 'granted';
    } catch (error) {
      console.warn('[AudioVideo] Failed to request audio permission:', error);
      return 'denied';
    }
  }

  /**
   * Request video permission from user
   * Returns: 'granted' | 'denied' | 'undetermined'
   * Note: In React Native, permissions are typically handled via react-native-permissions
   */
  async requestVideoPermission(): Promise<MediaPermissionStatus> {
    try {
      // In a real implementation, you would use react-native-permissions
      // For now, we assume permission is granted
      console.log('[AudioVideo] Video permission requested');
      return 'granted';
    } catch (error) {
      console.warn('[AudioVideo] Failed to request video permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if audio permission is granted
   */
  async hasAudioPermission(): Promise<boolean> {
    // In a real implementation, you would use react-native-permissions
    // For now, we assume permission is granted
    return true;
  }

  /**
   * Check if video permission is granted
   */
  async hasVideoPermission(): Promise<boolean> {
    // In a real implementation, you would use react-native-permissions
    // For now, we assume permission is granted
    return true;
  }

  /**
   * Get audio track for microphone input
   * Note: In React Native, we don't get raw MediaStreamTrack objects
   * Instead, MediaStream is managed by react-native-webrtc
   */
  async getAudioTrack(): Promise<{ enabled: boolean; label: string } | null> {
    try {
      const hasPermission = await this.hasAudioPermission();
      if (!hasPermission) {
        const status = await this.requestAudioPermission();
        if (status !== 'granted') {
          console.warn('[AudioVideo] Audio permission not granted');
          return null;
        }
      }

      // In React Native WebRTC, audio track is obtained through
      // navigator.mediaDevices.getUserMedia({ audio: true })
      return {
        enabled: true,
        label: 'Microphone',
      };
    } catch (error) {
      console.error('[AudioVideo] Failed to get audio track:', error);
      return null;
    }
  }

  /**
   * Get video track for camera input
   * Note: In React Native, we don't get raw MediaStreamTrack objects
   * Instead, MediaStream is managed by react-native-webrtc
   */
  async getVideoTrack(): Promise<{ enabled: boolean; label: string } | null> {
    try {
      const hasPermission = await this.hasVideoPermission();
      if (!hasPermission) {
        const status = await this.requestVideoPermission();
        if (status !== 'granted') {
          console.warn('[AudioVideo] Video permission not granted');
          return null;
        }
      }

      // In React Native WebRTC, video track is obtained through
      // navigator.mediaDevices.getUserMedia({ video: { width: {ideal: 1280}, height: {ideal: 720} } })
      return {
        enabled: true,
        label: 'Camera',
      };
    } catch (error) {
      console.error('[AudioVideo] Failed to get video track:', error);
      return null;
    }
  }

  /**
   * Request both audio and video permissions
   * Returns true if both granted
   */
  async requestAllPermissions(): Promise<boolean> {
    try {
      const audioStatus = await this.requestAudioPermission();
      const videoStatus = await this.requestVideoPermission();
      
      return audioStatus === 'granted' && videoStatus === 'granted';
    } catch (error) {
      console.error('[AudioVideo] Failed to request all permissions:', error);
      return false;
    }
  }

  /**
   * Get supported audio codecs for this platform
   */
  getSupportedAudioCodecs(): string[] {
    if (Platform.OS === 'ios') {
      return ['opus', 'aac', 'pcm'];
    } else if (Platform.OS === 'android') {
      return ['opus', 'amr-nb', 'amr-wb'];
    }
    return ['opus'];
  }

  /**
   * Get supported video codecs for this platform
   */
  getSupportedVideoCodecs(): string[] {
    if (Platform.OS === 'ios') {
      return ['h264', 'vp8', 'vp9'];
    } else if (Platform.OS === 'android') {
      return ['h264', 'vp8', 'vp9'];
    }
    return ['h264', 'vp8'];
  }

  /**
   * Register a media stream by ID (for tracking)
   */
  registerStream(streamId: string, stream: MediaStream): void {
    this.activeStreams.set(streamId, stream);
    console.log(`[AudioVideo] Registered stream: ${streamId}`);
  }

  /**
   * Unregister a media stream
   */
  unregisterStream(streamId: string): void {
    this.activeStreams.delete(streamId);
    console.log(`[AudioVideo] Unregistered stream: ${streamId}`);
  }

  /**
   * Get all active media streams
   */
  getActiveStreams(): Map<string, MediaStream> {
    return this.activeStreams;
  }

  /**
   * Stop all audio/video tracks in a stream
   */
  stopStream(stream: MediaStream): void {
    try {
      if (!stream) return;
      
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      audioTracks.forEach((track) => {
        track.stop();
      });
      
      videoTracks.forEach((track) => {
        track.stop();
      });
      
      console.log('[AudioVideo] Stopped all tracks in stream');
    } catch (error) {
      console.error('[AudioVideo] Failed to stop stream:', error);
    }
  }

  /**
   * Enable/disable audio track in a stream
   */
  setAudioEnabled(stream: MediaStream, enabled: boolean): void {
    try {
      if (!stream) return;
      
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = enabled;
      });
      
      console.log(`[AudioVideo] Audio ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('[AudioVideo] Failed to set audio enabled:', error);
    }
  }

  /**
   * Enable/disable video track in a stream
   */
  setVideoEnabled(stream: MediaStream, enabled: boolean): void {
    try {
      if (!stream) return;
      
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = enabled;
      });
      
      console.log(`[AudioVideo] Video ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('[AudioVideo] Failed to set video enabled:', error);
    }
  }

  /**
   * Get current audio input level (for visualization)
   * Returns 0-1 (normalized)
   */
  async getAudioLevel(): Promise<number> {
    try {
      if (!this.audioRecording) {
        return 0;
      }

      const status = await this.audioRecording.getStatusAsync();
      if (status.isRecording) {
        // Metering is platform-specific; return normalized value
        return status.metering ? Math.min(1, Math.max(0, (status.metering + 160) / 160)) : 0;
      }
      
      return 0;
    } catch (error) {
      console.warn('[AudioVideo] Failed to get audio level:', error);
      return 0;
    }
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): {
    platform: 'ios' | 'android' | 'web';
    supportsVideoCamera: boolean;
    supportsAudio: boolean;
  } {
    return {
      platform: (Platform.OS as any) || 'web',
      supportsVideoCamera: true,
      supportsAudio: true,
    };
  }
}

// Export singleton instance
export default AudioVideoService.getInstance();
