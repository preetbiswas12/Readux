"use strict";
/**
 * Project Aegis - Login Screen
 * User enters 12-word recovery seed to login
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
var LoginScreen = function (_a) {
    var onLoginComplete = _a.onLoginComplete, onSwitchToSignup = _a.onSwitchToSignup;
    var login = (0, AppContext_1.useApp)().login;
    var _b = (0, react_1.useState)(''), seedPhrase = _b[0], setSeedPhrase = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var handleLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var seed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    seed = seedPhrase.trim();
                    if (!seed) {
                        react_native_1.Alert.alert('Error', 'Please enter your 12-word recovery seed');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, login(seed)];
                case 2:
                    _a.sent();
                    onLoginComplete === null || onLoginComplete === void 0 ? void 0 : onLoginComplete();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    react_native_1.Alert.alert('Login Failed', error_1.message);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.View style={styles.content}>
        <react_native_1.Text style={styles.title}>Recover Your Account</react_native_1.Text>
        <react_native_1.Text style={styles.subtitle}>Enter your 12-word recovery seed</react_native_1.Text>

        <react_native_1.Text style={styles.label}>Recovery Seed (space-separated)</react_native_1.Text>
        <react_native_1.TextInput style={[styles.input, styles.seedInput]} placeholder="word1 word2 word3... word12" value={seedPhrase} onChangeText={setSeedPhrase} editable={!loading} placeholderTextColor="#999" multiline numberOfLines={4}/>

        <react_native_1.TouchableOpacity style={[styles.loginButton, loading && styles.buttonDisabled]} disabled={loading} onPress={handleLogin}>
          {loading ? (<react_native_1.ActivityIndicator color="#fff"/>) : (<react_native_1.Text style={styles.buttonText}>Login</react_native_1.Text>)}
        </react_native_1.TouchableOpacity>

        <react_native_1.Text style={styles.divider}>or</react_native_1.Text>

        <react_native_1.TouchableOpacity style={styles.signupLink} onPress={onSwitchToSignup} disabled={loading}>
          <react_native_1.Text style={styles.signupLinkText}>Create New Account</react_native_1.Text>
        </react_native_1.TouchableOpacity>

        <react_native_1.View style={styles.infoContainer}>
          <react_native_1.Text style={styles.infoTitle}>Need help?</react_native_1.Text>
          <react_native_1.Text style={styles.infoText}>
            • Your seed is 12 words separated by spaces
            {'\n'}• You should have written it down when you signed up
            {'\n'}• Double-check spelling carefully
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.ScrollView>);
};
exports.LoginScreen = LoginScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    seedInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        fontFamily: 'Menlo',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        textAlign: 'center',
        color: '#999',
        marginVertical: 16,
    },
    signupLink: {
        padding: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    signupLinkText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    infoText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
});
