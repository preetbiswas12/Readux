"use strict";
/**
 * Project Aegis - Chat List Screen
 * Shows list of conversations
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatListScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
var gundbService_1 = require("../services/gundbService");
var ChatDetailScreen_1 = require("./ChatDetailScreen");
var ChatListScreen = function (_a) {
    var onOpenSettings = _a.onOpenSettings;
    var _b = (0, AppContext_1.useApp)(), currentUser = _b.currentUser, appState = _b.appState, setOnline = _b.setOnline, logout = _b.logout, connectToPeer = _b.connectToPeer;
    var _c = (0, react_1.useState)([]), conversations = _c[0], setConversations = _c[1];
    var _d = (0, react_1.useState)(''), searchText = _d[0], setSearchText = _d[1];
    var _e = (0, react_1.useState)(null), selectedPeer = _e[0], setSelectedPeer = _e[1];
    var _f = (0, react_1.useState)(false), searching = _f[0], setSearching = _f[1];
    (0, react_1.useEffect)(function () {
        // Publish online status when entering this screen
        setOnline(true);
        return function () {
            // Optional: set offline when leaving
            // setOnline(false);
        };
    }, [setOnline]);
    var handleSearch = function () { return __awaiter(void 0, void 0, void 0, function () {
        var contact_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchText.trim()) {
                        react_native_1.Alert.alert('Error', 'Please enter a username to search');
                        return [2 /*return*/];
                    }
                    setSearching(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, gundbService_1.GunDBService.searchUser(searchText.trim())];
                case 2:
                    contact_1 = _a.sent();
                    if (!contact_1) return [3 /*break*/, 4];
                    // Add to conversations if not already there
                    setConversations(function (prev) {
                        var updated = __spreadArray([contact_1.alias], prev.filter(function (c) { return c !== contact_1.alias; }), true);
                        return updated;
                    });
                    // Try to connect to peer if online
                    return [4 /*yield*/, connectToPeer(contact_1.alias)];
                case 3:
                    // Try to connect to peer if online
                    _a.sent();
                    setSearchText('');
                    setSelectedPeer(contact_1.alias);
                    react_native_1.Alert.alert('Success', "Found @".concat(contact_1.alias, "!"));
                    return [3 /*break*/, 5];
                case 4:
                    react_native_1.Alert.alert('Not Found', "Could not find user @".concat(searchText));
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    react_native_1.Alert.alert('Error', 'Failed to search for user');
                    console.error('Search failed:', error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setSearching(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleLogout = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            react_native_1.Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', onPress: function () { } },
                {
                    text: 'Logout',
                    onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, logout()];
                                case 1:
                                    _b.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    react_native_1.Alert.alert('Error', 'Logout failed');
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); },
                    style: 'destructive',
                },
            ]);
            return [2 /*return*/];
        });
    }); };
    // Show chat detail screen if a conversation is selected
    if (selectedPeer) {
        return (<ChatDetailScreen_1.ChatDetailScreen peerAlias={selectedPeer} onBack={function () { return setSelectedPeer(null); }}/>);
    }
    return (<react_native_1.View style={styles.container}>
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.View>
          <react_native_1.Text style={styles.greeting}>Aegis Chat</react_native_1.Text>
          <react_native_1.Text style={styles.username}>@{currentUser === null || currentUser === void 0 ? void 0 : currentUser.alias}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.headerActions}>
          {/* Settings Button */}
          <react_native_1.TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
            <react_native_1.Text style={styles.settingsButtonText}>⚙️</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          
          {/* Status Badge */}
          <react_native_1.View style={styles.statusBadge}>
            <react_native_1.View style={[
            styles.statusDot,
            appState.isOnline ? styles.online : styles.offline,
        ]}/>
            <react_native_1.Text style={styles.statusText}>
              {appState.isOnline ? 'Online' : 'Offline'}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>

      {/* Search Bar */}
      <react_native_1.View style={styles.searchContainer}>
        <react_native_1.TextInput style={styles.searchInput} placeholder="Search for user (@alice)" value={searchText} onChangeText={setSearchText} placeholderTextColor="#999" editable={!searching}/>
        <react_native_1.TouchableOpacity style={[styles.searchButton, searching && styles.buttonDisabled]} onPress={handleSearch} disabled={searching}>
          <react_native_1.Text style={styles.searchButtonText}>
            {searching ? '...' : '🔍'}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      {/* Conversations List */}
      {conversations.length > 0 ? (<react_native_1.FlatList data={conversations} renderItem={function (_a) {
                var peerAlias = _a.item;
                return (<react_native_1.TouchableOpacity style={styles.conversationItem} onPress={function () { return setSelectedPeer(peerAlias); }}>
              <react_native_1.View style={styles.conversationContent}>
                <react_native_1.Text style={styles.conversationName}>@{peerAlias}</react_native_1.Text>
                <react_native_1.Text style={styles.conversationPreview}>
                  Tap to open conversation
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text style={styles.arrow}>›</react_native_1.Text>
            </react_native_1.TouchableOpacity>);
            }} keyExtractor={function (item) { return item; }} contentContainerStyle={styles.listContent}/>) : (<react_native_1.View style={styles.emptyContainer}>
          <react_native_1.Text style={styles.emptyTitle}>No conversations yet</react_native_1.Text>
          <react_native_1.Text style={styles.emptyText}>
            Search for a user above to start a conversation
          </react_native_1.Text>
        </react_native_1.View>)}

      {/* Footer Actions */}
      <react_native_1.View style={styles.footerContainer}>
        <react_native_1.TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleLogout}>
          <react_native_1.Text style={styles.buttonText}>Logout</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      {/* Debug Info */}
      <react_native_1.View style={styles.debugContainer}>
        <react_native_1.Text style={styles.debugTitle}>Phase 2: The Tunnel</react_native_1.Text>
        <react_native_1.Text style={styles.debugText}>
          ✓ Crypto & seeds (Phase 1){'\n'}
          ✓ WebRTC data channels{'\n'}
          ✓ Message sending/receiving{'\n'}
          ✓ ACK/READ packets{'\n'}
          ✓ Offline queue{'\n'}
          ⏳ Audio/Video (Phase 3){'\n'}
          ⏳ Background service (Phase 4)
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
exports.ChatListScreen = ChatListScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: 16,
    },
    greeting: {
        fontSize: 14,
        color: '#999',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButtonText: {
        fontSize: 18,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    online: {
        backgroundColor: '#34C759',
    },
    offline: {
        backgroundColor: '#999',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    searchButtonText: {
        fontSize: 18,
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    conversationContent: {
        flex: 1,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    conversationPreview: {
        fontSize: 13,
        color: '#999',
    },
    arrow: {
        fontSize: 18,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        textAlign: 'center',
    },
    footerContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    dangerButton: {
        backgroundColor: '#FF6B6B',
    },
    debugContainer: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
        fontFamily: 'Menlo',
    },
});
