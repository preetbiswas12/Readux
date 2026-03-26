"use strict";
/**
 * AudioVideoService - Audio/Video Capture & Permission Management
 *
 * Handles microphone and camera access for calls
 * Manages platform-specific permissions (iOS/Android)
 * Provides media stream creation for WebRTC
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
/**
 * AudioVideoService - Singleton for audio/video capture
 */
var AudioVideoService = /** @class */ (function () {
    function AudioVideoService() {
        this.audioRecording = null; // Type would be Audio.Recording from expo-av
        this.activeStreams = new Map();
        this.initializeAudioSession();
    }
    AudioVideoService.getInstance = function () {
        if (!AudioVideoService.instance) {
            AudioVideoService.instance = new AudioVideoService();
        }
        return AudioVideoService.instance;
    };
    /**
     * Initialize audio session for iOS
     */
    AudioVideoService.prototype.initializeAudioSession = function () {
        if (react_native_1.Platform.OS === 'ios') {
            // iOS-specific audio configuration
            // In a real app, you would use expo-av for audio setup
            console.log('[AudioVideo] iOS audio session initialized');
        }
    };
    /**
     * Request audio permission from user
     * Returns: 'granted' | 'denied' | 'undetermined'
     * Note: In React Native, permissions are typically handled via react-native-permissions
     */
    AudioVideoService.prototype.requestAudioPermission = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, you would use react-native-permissions
                    // For now, we assume permission is granted
                    console.log('[AudioVideo] Audio permission requested');
                    return [2 /*return*/, 'granted'];
                }
                catch (error) {
                    console.warn('[AudioVideo] Failed to request audio permission:', error);
                    return [2 /*return*/, 'denied'];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Request video permission from user
     * Returns: 'granted' | 'denied' | 'undetermined'
     * Note: In React Native, permissions are typically handled via react-native-permissions
     */
    AudioVideoService.prototype.requestVideoPermission = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, you would use react-native-permissions
                    // For now, we assume permission is granted
                    console.log('[AudioVideo] Video permission requested');
                    return [2 /*return*/, 'granted'];
                }
                catch (error) {
                    console.warn('[AudioVideo] Failed to request video permission:', error);
                    return [2 /*return*/, 'denied'];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if audio permission is granted
     */
    AudioVideoService.prototype.hasAudioPermission = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, you would use react-native-permissions
                // For now, we assume permission is granted
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Check if video permission is granted
     */
    AudioVideoService.prototype.hasVideoPermission = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, you would use react-native-permissions
                // For now, we assume permission is granted
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Get audio track for microphone input
     * Note: In React Native, we don't get raw MediaStreamTrack objects
     * Instead, MediaStream is managed by react-native-webrtc
     */
    AudioVideoService.prototype.getAudioTrack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, status_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.hasAudioPermission()];
                    case 1:
                        hasPermission = _a.sent();
                        if (!!hasPermission) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.requestAudioPermission()];
                    case 2:
                        status_1 = _a.sent();
                        if (status_1 !== 'granted') {
                            console.warn('[AudioVideo] Audio permission not granted');
                            return [2 /*return*/, null];
                        }
                        _a.label = 3;
                    case 3: 
                    // In React Native WebRTC, audio track is obtained through
                    // navigator.mediaDevices.getUserMedia({ audio: true })
                    return [2 /*return*/, {
                            enabled: true,
                            label: 'Microphone',
                        }];
                    case 4:
                        error_1 = _a.sent();
                        console.error('[AudioVideo] Failed to get audio track:', error_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get video track for camera input
     * Note: In React Native, we don't get raw MediaStreamTrack objects
     * Instead, MediaStream is managed by react-native-webrtc
     */
    AudioVideoService.prototype.getVideoTrack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, status_2, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.hasVideoPermission()];
                    case 1:
                        hasPermission = _a.sent();
                        if (!!hasPermission) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.requestVideoPermission()];
                    case 2:
                        status_2 = _a.sent();
                        if (status_2 !== 'granted') {
                            console.warn('[AudioVideo] Video permission not granted');
                            return [2 /*return*/, null];
                        }
                        _a.label = 3;
                    case 3: 
                    // In React Native WebRTC, video track is obtained through
                    // navigator.mediaDevices.getUserMedia({ video: { width: {ideal: 1280}, height: {ideal: 720} } })
                    return [2 /*return*/, {
                            enabled: true,
                            label: 'Camera',
                        }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('[AudioVideo] Failed to get video track:', error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Request both audio and video permissions
     * Returns true if both granted
     */
    AudioVideoService.prototype.requestAllPermissions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var audioStatus, videoStatus, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.requestAudioPermission()];
                    case 1:
                        audioStatus = _a.sent();
                        return [4 /*yield*/, this.requestVideoPermission()];
                    case 2:
                        videoStatus = _a.sent();
                        return [2 /*return*/, audioStatus === 'granted' && videoStatus === 'granted'];
                    case 3:
                        error_3 = _a.sent();
                        console.error('[AudioVideo] Failed to request all permissions:', error_3);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get supported audio codecs for this platform
     */
    AudioVideoService.prototype.getSupportedAudioCodecs = function () {
        if (react_native_1.Platform.OS === 'ios') {
            return ['opus', 'aac', 'pcm'];
        }
        else if (react_native_1.Platform.OS === 'android') {
            return ['opus', 'amr-nb', 'amr-wb'];
        }
        return ['opus'];
    };
    /**
     * Get supported video codecs for this platform
     */
    AudioVideoService.prototype.getSupportedVideoCodecs = function () {
        if (react_native_1.Platform.OS === 'ios') {
            return ['h264', 'vp8', 'vp9'];
        }
        else if (react_native_1.Platform.OS === 'android') {
            return ['h264', 'vp8', 'vp9'];
        }
        return ['h264', 'vp8'];
    };
    /**
     * Register a media stream by ID (for tracking)
     */
    AudioVideoService.prototype.registerStream = function (streamId, stream) {
        this.activeStreams.set(streamId, stream);
        console.log("[AudioVideo] Registered stream: ".concat(streamId));
    };
    /**
     * Unregister a media stream
     */
    AudioVideoService.prototype.unregisterStream = function (streamId) {
        this.activeStreams.delete(streamId);
        console.log("[AudioVideo] Unregistered stream: ".concat(streamId));
    };
    /**
     * Get all active media streams
     */
    AudioVideoService.prototype.getActiveStreams = function () {
        return this.activeStreams;
    };
    /**
     * Stop all audio/video tracks in a stream
     */
    AudioVideoService.prototype.stopStream = function (stream) {
        try {
            if (!stream)
                return;
            var audioTracks = stream.getAudioTracks();
            var videoTracks = stream.getVideoTracks();
            audioTracks.forEach(function (track) {
                track.stop();
            });
            videoTracks.forEach(function (track) {
                track.stop();
            });
            console.log('[AudioVideo] Stopped all tracks in stream');
        }
        catch (error) {
            console.error('[AudioVideo] Failed to stop stream:', error);
        }
    };
    /**
     * Enable/disable audio track in a stream
     */
    AudioVideoService.prototype.setAudioEnabled = function (stream, enabled) {
        try {
            if (!stream)
                return;
            var audioTracks = stream.getAudioTracks();
            audioTracks.forEach(function (track) {
                track.enabled = enabled;
            });
            console.log("[AudioVideo] Audio ".concat(enabled ? 'enabled' : 'disabled'));
        }
        catch (error) {
            console.error('[AudioVideo] Failed to set audio enabled:', error);
        }
    };
    /**
     * Enable/disable video track in a stream
     */
    AudioVideoService.prototype.setVideoEnabled = function (stream, enabled) {
        try {
            if (!stream)
                return;
            var videoTracks = stream.getVideoTracks();
            videoTracks.forEach(function (track) {
                track.enabled = enabled;
            });
            console.log("[AudioVideo] Video ".concat(enabled ? 'enabled' : 'disabled'));
        }
        catch (error) {
            console.error('[AudioVideo] Failed to set video enabled:', error);
        }
    };
    /**
     * Get current audio input level (for visualization)
     * Returns 0-1 (normalized)
     */
    AudioVideoService.prototype.getAudioLevel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.audioRecording) {
                            return [2 /*return*/, 0];
                        }
                        return [4 /*yield*/, this.audioRecording.getStatusAsync()];
                    case 1:
                        status_3 = _a.sent();
                        if (status_3.isRecording) {
                            // Metering is platform-specific; return normalized value
                            return [2 /*return*/, status_3.metering ? Math.min(1, Math.max(0, (status_3.metering + 160) / 160)) : 0];
                        }
                        return [2 /*return*/, 0];
                    case 2:
                        error_4 = _a.sent();
                        console.warn('[AudioVideo] Failed to get audio level:', error_4);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get platform info
     */
    AudioVideoService.prototype.getPlatformInfo = function () {
        return {
            platform: react_native_1.Platform.OS || 'web',
            supportsVideoCamera: true,
            supportsAudio: true,
        };
    };
    return AudioVideoService;
}());
// Export singleton instance
exports.default = AudioVideoService.getInstance();
