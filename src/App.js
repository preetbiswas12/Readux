"use strict";
/**
 * Project Aegis - Root App Component
 * Entry point with navigation logic
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
var react_1 = __importStar(require("react"));
var expo_status_bar_1 = require("expo-status-bar");
var AppContext_1 = require("./contexts/AppContext");
var SplashScreen_1 = require("./screens/SplashScreen");
var SignupScreen_1 = require("./screens/SignupScreen");
var LoginScreen_1 = require("./screens/LoginScreen");
var ChatListScreen_1 = require("./screens/ChatListScreen");
var SettingsScreen_1 = require("./screens/SettingsScreen");
var ErrorExportScreen_1 = require("./screens/ErrorExportScreen");
var TestingScreen_1 = require("./screens/TestingScreen");
var CallRequestScreen_1 = require("./screens/CallRequestScreen");
var CallScreen_1 = require("./screens/CallScreen");
// @ts-ignore - Importing service singleton instance
var CallService_1 = __importDefault(require("./services/CallService"));
var App = function () {
    var _a = (0, AppContext_1.useApp)(), isInitialized = _a.isInitialized, isLoading = _a.isLoading, appState = _a.appState, incomingCallRequest = _a.incomingCallRequest, acceptCall = _a.acceptCall, rejectCall = _a.rejectCall, endCall = _a.endCall, currentCallPeer = _a.currentCallPeer;
    var _b = (0, react_1.useState)('login'), authMode = _b[0], setAuthMode = _b[1];
    var _c = (0, react_1.useState)('chat-list'), currentScreen = _c[0], setCurrentScreen = _c[1];
    // Auto-navigate to call screen when call is active
    (0, react_1.useEffect)(function () {
        if (currentCallPeer && currentScreen !== 'call') {
            setCurrentScreen('call');
        }
        else if (!currentCallPeer && currentScreen === 'call') {
            setCurrentScreen('chat-list');
        }
    }, [currentCallPeer, currentScreen]);
    // Loading state
    if (!isInitialized || isLoading) {
        return <SplashScreen_1.SplashScreen />;
    }
    // Logged in - show current screen
    if (appState.isLoggedIn) {
        return (<>
        {currentScreen === 'chat-list' && (<ChatListScreen_1.ChatListScreen onOpenSettings={function () { return setCurrentScreen('settings'); }}/>)}
        {currentScreen === 'settings' && (<SettingsScreen_1.SettingsScreen onBack={function () { return setCurrentScreen('chat-list'); }} onOpenDiagnostics={function () { return setCurrentScreen('diagnostics'); }} onOpenTesting={function () { return setCurrentScreen('testing'); }}/>)}
        {currentScreen === 'diagnostics' && (<ErrorExportScreen_1.ErrorExportScreen onBack={function () { return setCurrentScreen('settings'); }}/>)}
        {currentScreen === 'testing' && (<TestingScreen_1.TestingScreen />)}
        {currentScreen === 'call' && currentCallPeer && (function () {
                var callSession = CallService_1.default.getCallSession(currentCallPeer);
                return callSession ? (<CallScreen_1.CallScreen peerAlias={currentCallPeer} callType={callSession.callType} onEndCall={function () {
                        endCall(currentCallPeer);
                        setCurrentScreen('chat-list');
                    }}/>) : null;
            })()}
        
        {/* Incoming call overlay (shown on top of current screen) */}
        {incomingCallRequest && currentScreen !== 'call' && (<CallRequestScreen_1.CallRequestScreen onAccept={function (callType) { return __awaiter(void 0, void 0, void 0, function () {
                    var error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, acceptCall(incomingCallRequest.from, callType)];
                            case 1:
                                _a.sent();
                                setCurrentScreen('call');
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                console.error('Failed to accept call:', error_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }} onReject={function () {
                    rejectCall(incomingCallRequest.from);
                }}/>)}
        
        <expo_status_bar_1.StatusBar hidden={false}/>
      </>);
    }
    // Auth state - show signup or login
    if (authMode === 'signup') {
        return (<>
        <SignupScreen_1.SignupScreen onSignupComplete={function () { return setAuthMode('login'); }}/>
        <expo_status_bar_1.StatusBar hidden={false}/>
      </>);
    }
    return (<>
      <LoginScreen_1.LoginScreen onLoginComplete={function () {
            // Will redirect to ChatListScreen due to appState.isLoggedIn
        }} onSwitchToSignup={function () { return setAuthMode('signup'); }}/>
      <expo_status_bar_1.StatusBar hidden={false}/>
    </>);
};
exports.App = App;
