// Main App component

import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './navigation/AppNavigator';
import { AIService } from './services/ai/AIService';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize AI services
      await AIService.initialize();

      // Check for root/tamper detection
      // TODO: Implement RootDetection.isRooted()

      setIsInitializing(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setInitError('Failed to initialize app');
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <Text style={styles.loadingEmoji}>🔒</Text>
        <Text style={styles.loadingText}>Initializing Vault...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default App;
