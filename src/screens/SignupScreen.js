"use strict";
/**
 * Project Aegis - Signup Screen
 * User creates account and receives 12-word recovery seed
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
exports.SignupScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
var SignupScreen = function (_a) {
    var onSignupComplete = _a.onSignupComplete;
    var signup = (0, AppContext_1.useApp)().signup;
    var _b = (0, react_1.useState)(''), alias = _b[0], setAlias = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), seedPhrase = _d[0], setSeedPhrase = _d[1];
    var _e = (0, react_1.useState)(false), seedCopied = _e[0], setSeedCopied = _e[1];
    var _f = (0, react_1.useState)(false), confirmCopy = _f[0], setConfirmCopy = _f[1];
    var handleSignup = function () { return __awaiter(void 0, void 0, void 0, function () {
        var seed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!alias.trim()) {
                        react_native_1.Alert.alert('Error', 'Please enter a username');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signup(alias.trim())];
                case 2:
                    seed = (_a.sent()).seed;
                    setSeedPhrase(seed);
                    react_native_1.Alert.alert('Account Created!', 'Your 12-word recovery seed has been generated.\n\n⚠️  Save it safely. This is your only way to recover your account.');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    react_native_1.Alert.alert('Signup Failed', error_1.message);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (seedPhrase) {
        return (<react_native_1.ScrollView style={styles.container}>
        <react_native_1.View style={styles.content}>
          <react_native_1.Text style={styles.title}>Your Recovery Seed</react_native_1.Text>
          <react_native_1.Text style={styles.warning}>
            ⚠️  Keep this seed safe. Anyone with this seed can access your account.
          </react_native_1.Text>

          <react_native_1.View style={styles.seedBox}>
            <react_native_1.Text style={styles.seedText}>{seedPhrase}</react_native_1.Text>
          </react_native_1.View>

          <react_native_1.TouchableOpacity style={styles.copyButton} onPress={function () {
                // In real app: use Clipboard API
                setSeedCopied(true);
                setTimeout(function () { return setSeedCopied(false); }, 2000);
            }}>
            <react_native_1.Text style={styles.buttonText}>
              {seedCopied ? '✓ Copied!' : 'Copy to Clipboard'}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>

          <react_native_1.View style={styles.checkboxContainer}>
            <react_native_1.TouchableOpacity style={[styles.checkbox, confirmCopy && styles.checkboxChecked]} onPress={function () { return setConfirmCopy(!confirmCopy); }}>
              {confirmCopy && <react_native_1.Text style={styles.checkmark}>✓</react_native_1.Text>}
            </react_native_1.TouchableOpacity>
            <react_native_1.Text style={styles.checkboxLabel}>
              I have saved my recovery seed in a safe place
            </react_native_1.Text>
          </react_native_1.View>

          <react_native_1.TouchableOpacity style={[styles.continueButton, !confirmCopy && styles.buttonDisabled]} disabled={!confirmCopy} onPress={function () {
                setSeedPhrase(null);
                onSignupComplete === null || onSignupComplete === void 0 ? void 0 : onSignupComplete();
            }}>
            <react_native_1.Text style={styles.buttonText}>Continue to Chat</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.ScrollView>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.content}>
        <react_native_1.Text style={styles.title}>Create Account</react_native_1.Text>

        <react_native_1.Text style={styles.label}>Username (e.g., @alice)</react_native_1.Text>
        <react_native_1.TextInput style={styles.input} placeholder="Your username" value={alias} onChangeText={setAlias} editable={!loading} placeholderTextColor="#999"/>

        <react_native_1.TouchableOpacity style={[styles.signupButton, loading && styles.buttonDisabled]} disabled={loading} onPress={handleSignup}>
          {loading ? (<react_native_1.ActivityIndicator color="#fff"/>) : (<react_native_1.Text style={styles.buttonText}>Create Account</react_native_1.Text>)}
        </react_native_1.TouchableOpacity>

        <react_native_1.Text style={styles.info}>
          You will receive a 12-word recovery seed.
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
exports.SignupScreen = SignupScreen;
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
        marginBottom: 20,
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
    signupButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    continueButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    info: {
        fontSize: 13,
        color: '#666',
        marginTop: 20,
        lineHeight: 20,
    },
    warning: {
        fontSize: 14,
        color: '#FF6B6B',
        marginBottom: 16,
        fontWeight: '500',
    },
    seedBox: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#FFB84D',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    seedText: {
        fontSize: 16,
        lineHeight: 28,
        color: '#333',
        fontFamily: 'Menlo',
    },
    copyButton: {
        backgroundColor: '#34C759',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
    },
    checkmark: {
        color: '#fff',
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
});
