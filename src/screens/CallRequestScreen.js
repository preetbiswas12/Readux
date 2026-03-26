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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallRequestScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
/**
 * CallRequestScreen displays incoming call notifications
 *
 * Features:
 * - Caller name and call type (audio/video)
 * - Accept/Reject buttons
 * - Ringtone animation (pulsing effect)
 * - Call badges (audio🎤 / video📹)
 */
var CallRequestScreen = function (_a) {
    var onAccept = _a.onAccept, onReject = _a.onReject;
    var incomingCallRequest = (0, AppContext_1.useApp)().incomingCallRequest;
    var scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    // Pulsing ringtone effect
    (0, react_1.useEffect)(function () {
        var pulse = react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 600,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]));
        pulse.start();
        return function () { return pulse.stop(); };
    }, [scaleAnim]);
    if (!incomingCallRequest) {
        return null;
    }
    var handleAcceptAudio = function () {
        onAccept('audio');
    };
    var handleAcceptVideo = function () {
        onAccept('video');
    };
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.View style={styles.content}>
        {/* Caller Info */}
        <react_native_1.Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <react_native_1.View style={styles.callerCard}>
            <react_native_1.Text style={styles.callTypeEmoji}>
              {incomingCallRequest.type === 'video' ? '📹' : '🎤'}
            </react_native_1.Text>
            <react_native_1.Text style={styles.callerName}>{incomingCallRequest.from}</react_native_1.Text>
            <react_native_1.Text style={styles.callTypeText}>
              {incomingCallRequest.type === 'video' ? 'Video Call' : 'Audio Call'}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Animated.View>

        {/* Call Time */}
        <react_native_1.Text style={styles.callTimeText}>Incoming...</react_native_1.Text>

        {/* Action Buttons */}
        <react_native_1.View style={styles.actions}>
          {/* Reject Button */}
          <react_native_1.TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <react_native_1.Text style={styles.actionIcon}>☎️</react_native_1.Text>
            <react_native_1.Text style={styles.actionLabel}>Reject</react_native_1.Text>
          </react_native_1.TouchableOpacity>

          {/* Accept Audio Button */}
          <react_native_1.TouchableOpacity style={styles.acceptButton} onPress={handleAcceptAudio}>
            <react_native_1.Text style={styles.actionIcon}>🎤</react_native_1.Text>
            <react_native_1.Text style={styles.actionLabel}>Audio</react_native_1.Text>
          </react_native_1.TouchableOpacity>

          {/* Accept Video Button (only if caller requested video) */}
          {incomingCallRequest.type === 'video' && (<react_native_1.TouchableOpacity style={styles.acceptButton} onPress={handleAcceptVideo}>
              <react_native_1.Text style={styles.actionIcon}>📹</react_native_1.Text>
              <react_native_1.Text style={styles.actionLabel}>Video</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
exports.CallRequestScreen = CallRequestScreen;
var styles = react_native_1.StyleSheet.create({
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
exports.default = exports.CallRequestScreen;
