/**
 * Project Aegis - Root App Component
 * Entry point with navigation logic
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../contexts/AppContext';
import { SplashScreen } from '../screens/SplashScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ChatListScreen } from '../screens/ChatListScreen';

type AuthMode = 'signup' | 'login';

export const App: React.FC = () => {
  const { isInitialized, isLoading, appState } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Loading state
  if (!isInitialized || isLoading) {
    return <SplashScreen />;
  }

  // Logged in - show chat list
  if (appState.isLoggedIn) {
    return (
      <>
        <ChatListScreen />
        <StatusBar barStyle="dark-content" />
      </>
    );
  }

  // Auth state - show signup or login
  if (authMode === 'signup') {
    return (
      <>
        <SignupScreen onSignupComplete={() => setAuthMode('login')} />
        <StatusBar barStyle="dark-content" />
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
      <StatusBar barStyle="dark-content" />
    </>
  );
};
