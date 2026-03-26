"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_webrtc_1 = require("react-native-webrtc");
// @ts-ignore - Importing service singleton instance
var CallService_1 = __importDefault(require("../services/CallService"));
var AppContext_1 = require("../contexts/AppContext");
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
var CallScreen = function (_a) {
    var _b, _c;
    var peerAlias = _a.peerAlias, initialCallType = _a.callType, onEndCall = _a.onEndCall;
    var appState = (0, AppContext_1.useApp)().appState;
    var _d = (0, react_1.useState)('active'), callState = _d[0], setCallState = _d[1];
    var _e = (0, react_1.useState)(0), callDuration = _e[0], setCallDuration = _e[1];
    var _f = (0, react_1.useState)(null), localStream = _f[0], setLocalStream = _f[1];
    var _g = (0, react_1.useState)(null), remoteStream = _g[0], setRemoteStream = _g[1];
    var _h = (0, react_1.useState)(true), isLoading = _h[0], setIsLoading = _h[1];
    var _j = (0, react_1.useState)(false), isMuted = _j[0], setIsMuted = _j[1];
    var _k = (0, react_1.useState)(false), isCameraOff = _k[0], setIsCameraOff = _k[1];
    var callType = (0, react_1.useState)(initialCallType)[0];
    var callDurationIntervalRef = (0, react_1.useRef)(null);
    // Subscribe to call state changes
    (0, react_1.useEffect)(function () {
        var handleCallStateChange = function (state) {
            setCallState(state);
            if (state === 'ended') {
                void handleEndCall();
            }
        };
        CallService_1.default.onCallStateChange(peerAlias, handleCallStateChange);
    }, [peerAlias]); // eslint-disable-line react-hooks/exhaustive-deps
    // Setup call duration timer
    (0, react_1.useEffect)(function () {
        callDurationIntervalRef.current = setInterval(function () {
            var duration = CallService_1.default.getCallDuration(peerAlias);
            setCallDuration(duration);
        }, 1000);
        return function () {
            if (callDurationIntervalRef.current) {
                if (callDurationIntervalRef.current) {
                    clearInterval(callDurationIntervalRef.current);
                }
            }
        };
    }, [peerAlias]);
    // Monitor streams
    (0, react_1.useEffect)(function () {
        var session = CallService_1.default.getCallSession(peerAlias);
        if (session) {
            setLocalStream(session.localStream || null);
            setRemoteStream(session.remoteStream || null);
            setIsLoading(!session.localStream); // Wait for local stream to be ready
        }
    }, [peerAlias]);
    // Handle end call
    var handleEndCall = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (callDurationIntervalRef.current) {
                        clearInterval(callDurationIntervalRef.current);
                    }
                    return [4 /*yield*/, CallService_1.default.endCall(peerAlias)];
                case 1:
                    _a.sent();
                    onEndCall();
                    return [2 /*return*/];
            }
        });
    }); };
    // Toggle audio mute
    var handleToggleMute = function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, audioTracks;
        return __generator(this, function (_a) {
            session = CallService_1.default.getCallSession(peerAlias);
            if (session === null || session === void 0 ? void 0 : session.localStream) {
                audioTracks = session.localStream.getAudioTracks();
                audioTracks.forEach(function (track) {
                    track.enabled = isMuted; // Toggle
                });
                setIsMuted(!isMuted);
            }
            return [2 /*return*/];
        });
    }); };
    // Toggle camera
    var handleToggleCamera = function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, videoTracks;
        return __generator(this, function (_a) {
            session = CallService_1.default.getCallSession(peerAlias);
            if (session === null || session === void 0 ? void 0 : session.localStream) {
                videoTracks = session.localStream.getVideoTracks();
                videoTracks.forEach(function (track) {
                    track.enabled = isCameraOff; // Toggle
                });
                setIsCameraOff(!isCameraOff);
            }
            return [2 /*return*/];
        });
    }); };
    // Format call duration
    var formatDuration = function (seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        if (hours > 0) {
            return "".concat(hours, ":").concat(String(minutes).padStart(2, '0'), ":").concat(String(secs).padStart(2, '0'));
        }
        return "".concat(String(minutes).padStart(2, '0'), ":").concat(String(secs).padStart(2, '0'));
    };
    return (<react_native_1.SafeAreaView style={styles.container}>
      {/* Remote Stream (Main Display) */}
      {callType === 'video' && remoteStream ? (<react_native_webrtc_1.RTCView streamURL={((_b = remoteStream === null || remoteStream === void 0 ? void 0 : remoteStream.toURL) === null || _b === void 0 ? void 0 : _b.call(remoteStream)) || ''} style={styles.remoteStream} objectFit="cover"/>) : (<react_native_1.View style={styles.audioCallContainer}>
          <react_native_1.View style={styles.audioPlaceholder}>
            <react_native_1.Text style={styles.audioPlaceholderEmoji}>🎤</react_native_1.Text>
            <react_native_1.Text style={styles.audioPlaceholderText}>{peerAlias}</react_native_1.Text>
            <react_native_1.Text style={styles.audioPlaceholderSubtext}>Audio Call Active</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>)}

      {/* Local Stream (Picture-in-Picture) */}
      {callType === 'video' && localStream && !isCameraOff && (<react_native_webrtc_1.RTCView streamURL={((_c = localStream === null || localStream === void 0 ? void 0 : localStream.toURL) === null || _c === void 0 ? void 0 : _c.call(localStream)) || ''} style={styles.localStream} objectFit="cover"/>)}

      {/* Call Info Overlay */}
      <react_native_1.View style={styles.overlay}>
        {/* Header */}
        <react_native_1.View style={styles.header}>
          <react_native_1.View style={styles.callInfo}>
            <react_native_1.Text style={styles.peerName}>{peerAlias}</react_native_1.Text>
            <react_native_1.View style={styles.statusRow}>
              <react_native_1.View style={[
            styles.statusBadge,
            { backgroundColor: appState.isOnline ? '#4ade80' : '#9ca3af' },
        ]}/>
              <react_native_1.Text style={styles.statusText}>
                {appState.isOnline ? 'Connected' : 'Disconnected'}
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          <react_native_1.Text style={styles.duration}>{formatDuration(callDuration)}</react_native_1.Text>
        </react_native_1.View>

        {/* Call Controls */}
        <react_native_1.View style={styles.controls}>
          {/* Mute Button */}
          <react_native_1.TouchableOpacity style={[styles.controlButton, isMuted && styles.controlButtonActive]} onPress={handleToggleMute}>
            <react_native_1.Text style={styles.controlButtonIcon}>{isMuted ? '🔇' : '🎤'}</react_native_1.Text>
            <react_native_1.Text style={styles.controlButtonLabel}>{isMuted ? 'Unmute' : 'Mute'}</react_native_1.Text>
          </react_native_1.TouchableOpacity>

          {/* Camera Toggle (Video only) */}
          {callType === 'video' && (<react_native_1.TouchableOpacity style={[styles.controlButton, isCameraOff && styles.controlButtonActive]} onPress={handleToggleCamera}>
              <react_native_1.Text style={styles.controlButtonIcon}>{isCameraOff ? '📷' : '📹'}</react_native_1.Text>
              <react_native_1.Text style={styles.controlButtonLabel}>{isCameraOff ? 'Camera Off' : 'Camera On'}</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}

          {/* End Call Button */}
          <react_native_1.TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={handleEndCall}>
            <react_native_1.Text style={styles.controlButtonIcon}>☎️</react_native_1.Text>
            <react_native_1.Text style={styles.controlButtonLabel}>End Call</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.View>

      {/* Loading State */}
      {isLoading && (<react_native_1.View style={styles.loadingOverlay}>
          <react_native_1.ActivityIndicator size="large" color="#ffffff"/>
          <react_native_1.Text style={styles.loadingText}>Connecting to {peerAlias}...</react_native_1.Text>
        </react_native_1.View>)}

      {/* Call Ended Overlay */}
      {callState === 'ended' && (<react_native_1.View style={styles.endedOverlay}>
          <react_native_1.Text style={styles.endedText}>Call Ended</react_native_1.Text>
          <react_native_1.Text style={styles.endedDuration}>Duration: {formatDuration(callDuration)}</react_native_1.Text>
        </react_native_1.View>)}
    </react_native_1.SafeAreaView>);
};
exports.CallScreen = CallScreen;
var styles = react_native_1.StyleSheet.create({
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
exports.default = exports.CallScreen;
