/**
 * Project Aegis - Root App Component
 * Entry point with navigation logic
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useApp } from './contexts/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { SignupScreen } from './screens/SignupScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ChatListScreen } from './screens/ChatListScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ErrorExportScreen } from './screens/ErrorExportScreen';
import { TestingScreen } from './screens/TestingScreen';
import { CallRequestScreen } from './screens/CallRequestScreen';
import { CallScreen } from './screens/CallScreen';
// @ts-ignore - Importing service singleton instance
import CallService from './services/CallService';

type AuthMode = 'signup' | 'login';
type AppScreen = 'chat-list' | 'settings' | 'diagnostics' | 'testing' | 'call';

export const App: React.FC = () => {
  const { isInitialized, isLoading, appState, incomingCallRequest, acceptCall, rejectCall, endCall, currentCallPeer } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('chat-list');

  // Auto-navigate to call screen when call is active
  useEffect(() => {
    if (currentCallPeer && currentScreen !== 'call') {
      setCurrentScreen('call');
    } else if (!currentCallPeer && currentScreen === 'call') {
      setCurrentScreen('chat-list');
    }
  }, [currentCallPeer, currentScreen]);

  // Loading state
  if (!isInitialized || isLoading) {
    return <SplashScreen />;
  }

  // Logged in - show current screen
  if (appState.isLoggedIn) {
    return (
      <>
        {currentScreen === 'chat-list' && (
          <ChatListScreen onOpenSettings={() => setCurrentScreen('settings')} />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={() => setCurrentScreen('chat-list')}
            onOpenDiagnostics={() => setCurrentScreen('diagnostics')}
            onOpenTesting={() => setCurrentScreen('testing')}
          />
        )}
        {currentScreen === 'diagnostics' && (
          <ErrorExportScreen onBack={() => setCurrentScreen('settings')} />
        )}
        {currentScreen === 'testing' && (
          <TestingScreen />
        )}
        {currentScreen === 'call' && currentCallPeer && (() => {
          const callSession = CallService.getCallSession(currentCallPeer);
          return callSession ? (
            <CallScreen
              peerAlias={currentCallPeer}
              callType={callSession.callType}
              onEndCall={() => {
                endCall(currentCallPeer);
                setCurrentScreen('chat-list');
              }}
            />
          ) : null;
        })()}
        
        {/* Incoming call overlay (shown on top of current screen) */}
        {incomingCallRequest && currentScreen !== 'call' && (
          <CallRequestScreen
            onAccept={async (callType) => {
              try {
                await acceptCall(incomingCallRequest.from, callType);
                setCurrentScreen('call');
              } catch (error) {
                console.error('Failed to accept call:', error);
              }
            }}
            onReject={() => {
              rejectCall(incomingCallRequest.from);
            }}
          />
        )}
        
        <StatusBar hidden={false} />
      </>
    );
  }

  // Auth state - show signup or login
  if (authMode === 'signup') {
    return (
      <>
        <SignupScreen onSignupComplete={() => setAuthMode('login')} />
        <StatusBar hidden={false} />
      </>
    );
  }

  return (
    <>
      <LoginScreen
        onLoginComplete={() => {
          // Will redirect to ChatListScreen due to appState.isLoggedIn
        }}
        onSwitchToSignup={() => setAuthMode('signup')}
      />
      <StatusBar hidden={false} />
    </>
  );
};
