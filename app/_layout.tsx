import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from '../src/contexts/AppContext';
import { App } from '../src/App';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <App />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
