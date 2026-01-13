// Login screen with PIN/Biometric authentication

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Button } from '@components/Button';
import { EncryptionService } from '@services/encryption/EncryptionService';
import { DatabaseService } from '@services/database/DatabaseService';
import { useAppStore } from '@store/appStore';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';

const rnBiometrics = new ReactNativeBiometrics();

export const LoginScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { setUnlocked, settings } = useAppStore();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      setBiometricAvailable(available && settings.securitySettings.biometricEnabled);
    } catch (error) {
      console.error('Biometric check failed:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to unlock vault',
      });

      if (success) {
        // In production, retrieve encrypted PIN from keychain and unlock
        Alert.alert('Success', 'Biometric authentication successful');
      }
    } catch (error) {
      console.error('Biometric auth failed:', error);
      Alert.alert('Authentication Failed', 'Please use PIN');
    }
  };

  const handleUnlock = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter your PIN');
      return;
    }

    setLoading(true);

    try {
      // Verify PIN
      const isValid = await EncryptionService.verifyPIN(pin);
      if (!isValid) {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
        setPin('');
        return;
      }

      // Initialize database
      const dbSuccess = await DatabaseService.initialize();
      if (!dbSuccess) {
        throw new Error('Failed to initialize database');
      }

      setUnlocked(true);
    } catch (error) {
      console.error('Unlock failed:', error);
      Alert.alert('Unlock Failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Unlock Vault</Text>
        <Text style={styles.subtitle}>Enter your PIN to access your documents</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={8}
            placeholder="Enter PIN"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            data-testid="unlock-pin-input"
          />
        </View>

        <Button
          title="Unlock"
          onPress={handleUnlock}
          loading={loading}
          size="large"
          style={styles.button}
          testID="unlock-button"
        />

        {biometricAvailable && (
          <TouchableOpacity
            onPress={handleBiometricAuth}
            style={styles.biometricButton}>
            <Text style={styles.biometricText}>👆 Use Biometrics</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    letterSpacing: 12,
  },
  button: {
    width: '100%',
  },
  biometricButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  biometricText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
