"use strict";
/**
 * Project Aegis - Splash Screen
 * Initial loading screen during app startup
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplashScreen = void 0;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var SplashScreen = function () {
    // Splash screen is shown while app initializes
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.logo}>⚡ Aegis Chat</react_native_1.Text>
      <react_native_1.Text style={styles.subtitle}>Initializing P2P Network...</react_native_1.Text>
      <react_native_1.ActivityIndicator size="large" color="#007AFF" style={styles.spinner}/>
    </react_native_1.View>);
};
exports.SplashScreen = SplashScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
    },
    spinner: {
        marginTop: 20,
    },
});
