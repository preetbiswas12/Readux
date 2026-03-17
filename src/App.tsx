/**
 * Project Aegis - Root App Component
 * Entry point with navigation logic
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useApp } from './contexts/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { SignupScreen } from './screens/SignupScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ChatListScreen } from './screens/ChatListScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ErrorExportScreen } from './screens/ErrorExportScreen';

type AuthMode = 'signup' | 'login';
type AppScreen = 'chat-list' | 'settings' | 'diagnostics';

export const App: React.FC = () => {
  const { isInitialized, isLoading, appState } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('chat-list');

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
          />
        )}
        {currentScreen === 'diagnostics' && (
          <ErrorExportScreen onBack={() => setCurrentScreen('settings')} />
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
