"use strict";
/**
 * Project Aegis - Chat Detail Screen
 * Shows message history with a peer and allows sending new messages
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatDetailScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
var MessageService_1 = require("../services/MessageService");
var WebRTCService_1 = __importDefault(require("../services/WebRTCService"));
var gundbService_1 = require("../services/gundbService");
var ChatDetailScreen = function (_a) {
    var peerAlias = _a.peerAlias, onBack = _a.onBack;
    var currentUser = (0, AppContext_1.useApp)().currentUser;
    var _b = (0, react_1.useState)([]), messages = _b[0], setMessages = _b[1];
    var _c = (0, react_1.useState)(''), inputText = _c[0], setInputText = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), sending = _e[0], setSending = _e[1];
    var _f = (0, react_1.useState)(false), isConnected = _f[0], setIsConnected = _f[1];
    var flatListRef = (0, react_1.useRef)(null);
    // Load chat history on mount
    (0, react_1.useEffect)(function () {
        var loadHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
            var history_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!currentUser)
                            return [2 /*return*/];
                        return [4 /*yield*/, MessageService_1.MessageService.getChatHistory(currentUser.alias, peerAlias, 100)];
                    case 1:
                        history_1 = _a.sent();
                        // Reverse to show newest at bottom
                        setMessages(history_1.reverse());
                        setLoading(false);
                        // Check if already connected
                        setIsConnected(WebRTCService_1.default.isConnected(peerAlias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Load history failed:', error_1);
                        setLoading(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        loadHistory();
    }, [peerAlias, currentUser]);
    // Listen for incoming messages
    (0, react_1.useEffect)(function () {
        var unsubscribe = MessageService_1.MessageService.onMessage(peerAlias, function (message) {
            var _a;
            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [message], false); });
            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd();
            // Auto-send READ packet after 500ms
            setTimeout(function () {
                if (currentUser) {
                    MessageService_1.MessageService.sendREAD(currentUser.alias, peerAlias, message.id);
                }
            }, 500);
        });
        return unsubscribe;
    }, [peerAlias, currentUser]);
    // Monitor connection status
    (0, react_1.useEffect)(function () {
        var checkInterval = setInterval(function () {
            setIsConnected(WebRTCService_1.default.isConnected(peerAlias));
        }, 1000);
        return function () { return clearInterval(checkInterval); };
    }, [peerAlias]);
    var handleSendMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var peerPublicKey, peerData, error_2, messageId, optimisticMessage_1, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!inputText.trim() || !currentUser) {
                        return [2 /*return*/];
                    }
                    setSending(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    peerPublicKey = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, gundbService_1.GunDBService.searchUser(peerAlias)];
                case 3:
                    peerData = _b.sent();
                    if (!(peerData === null || peerData === void 0 ? void 0 : peerData.publicKey)) {
                        react_native_1.Alert.alert('User not found', "Cannot find public key for ".concat(peerAlias));
                        setSending(false);
                        return [2 /*return*/];
                    }
                    peerPublicKey = peerData.publicKey;
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _b.sent();
                    console.error('Failed to fetch peer public key:', error_2);
                    react_native_1.Alert.alert('Connection Error', 'Failed to retrieve encryption key');
                    setSending(false);
                    return [2 /*return*/];
                case 5: return [4 /*yield*/, MessageService_1.MessageService.sendMessage(currentUser.alias, peerAlias, inputText.trim(), peerPublicKey // ✅ Real public key
                    )];
                case 6:
                    messageId = _b.sent();
                    // Clear input
                    setInputText('');
                    optimisticMessage_1 = {
                        id: messageId,
                        from: currentUser.alias,
                        to: peerAlias,
                        content: inputText.trim(),
                        timestamp: Date.now(),
                        type: 'text',
                        encrypted: true,
                        delivered: isConnected,
                        read: false,
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [optimisticMessage_1], false); });
                    (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd();
                    return [3 /*break*/, 9];
                case 7:
                    error_3 = _b.sent();
                    console.error('Send message failed:', error_3);
                    return [3 /*break*/, 9];
                case 8:
                    setSending(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var renderMessage = function (_a) {
        var item = _a.item;
        var isOwn = item.from === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.alias);
        return (<react_native_1.View style={[styles.messageRow, isOwn && styles.ownMessageRow]}>
        <react_native_1.View style={[styles.messageBubble, isOwn && styles.ownBubble]}>
          <react_native_1.Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.content}
          </react_native_1.Text>
          <react_native_1.View style={styles.messageFooter}>
            <react_native_1.Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })}
            </react_native_1.Text>
            {isOwn && (<react_native_1.Text style={styles.ticks}>
                {item.read ? '✓✓' : item.delivered ? '✓' : ''}
              </react_native_1.Text>)}
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>);
    };
    if (loading) {
        return (<react_native_1.View style={[styles.container, styles.centerContent]}>
        <react_native_1.ActivityIndicator size="large" color="#007AFF"/>
        <react_native_1.Text style={styles.loadingText}>Loading chat history...</react_native_1.Text>
      </react_native_1.View>);
    }
    return (<react_native_1.KeyboardAvoidingView style={styles.container} behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.View style={styles.headerContent}>
          <react_native_1.TouchableOpacity onPress={onBack}>
            <react_native_1.Text style={styles.backButton}>← Back</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.View style={styles.headerInfo}>
            <react_native_1.Text style={styles.peerName}>@{peerAlias}</react_native_1.Text>
            <react_native_1.Text style={[styles.status, isConnected && styles.statusOnline]}>
              {isConnected ? '🟢 Online' : '⚪ Offline'}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>

      {/* Messages */}
      <react_native_1.FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={function (item) { return item.id; }} contentContainerStyle={styles.messagesList} ListEmptyComponent={<react_native_1.View style={styles.emptyState}>
            <react_native_1.Text style={styles.emptyTitle}>No messages yet</react_native_1.Text>
            <react_native_1.Text style={styles.emptyText}>Start a conversation with @{peerAlias}</react_native_1.Text>
          </react_native_1.View>} onContentSizeChange={function () { var _a; return (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd(); }}/>

      {/* Input */}
      <react_native_1.View style={styles.inputContainer}>
        <react_native_1.TextInput style={styles.input} placeholder="Type a message..." value={inputText} onChangeText={setInputText} editable={!sending} placeholderTextColor="#999" multiline maxLength={1000}/>
        <react_native_1.TouchableOpacity style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
        ]} onPress={handleSendMessage} disabled={!inputText.trim() || sending}>
          {sending ? (<react_native_1.ActivityIndicator color="#fff" size="small"/>) : (<react_native_1.Text style={styles.sendButtonText}>Send</react_native_1.Text>)}
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.KeyboardAvoidingView>);
};
exports.ChatDetailScreen = ChatDetailScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    backButton: {
        fontSize: 16,
        color: '#007AFF',
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    peerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    statusOnline: {
        color: '#34C759',
    },
    messagesList: {
        padding: 12,
    },
    messageRow: {
        marginVertical: 4,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    ownMessageRow: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        backgroundColor: '#e5e5ea',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    ownBubble: {
        backgroundColor: '#007AFF',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#fff',
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 11,
        color: '#999',
    },
    ownTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    ticks: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
    inputContainer: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
