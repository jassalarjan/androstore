// Onboarding screen for first-time setup

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Button } from '@components/Button';
import { EncryptionService } from '@services/encryption/EncryptionService';
import { DatabaseService } from '@services/database/DatabaseService';
import { useAppStore } from '@store/appStore';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { setFirstLaunch, setUnlocked, updateSettings } = useAppStore();

  const handleCreatePIN = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    setLoading(true);

    try {
      // Initialize encryption with PIN
      const success = await EncryptionService.initializeFromPIN(pin);
      if (!success) {
        throw new Error('Failed to initialize encryption');
      }

      // Initialize database
      const dbSuccess = await DatabaseService.initialize();
      if (!dbSuccess) {
        throw new Error('Failed to initialize database');
      }

      // Update settings
      updateSettings({
        securitySettings: {
          biometricEnabled: false,
          autoLockTimeout: 300,
          screenshotBlocking: true,
          decoyVaultEnabled: false,
          masterKeySet: true,
        },
      });

      setFirstLaunch(false);
      setUnlocked(true);
    } catch (error) {
      console.error('Setup failed:', error);
      Alert.alert('Setup Failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.title}>Welcome to Document Vault</Text>
          <Text style={styles.subtitle}>
            Your private, encrypted second brain for important documents
          </Text>

          <View style={styles.features}>
            <FeatureItem
              icon="📱"
              title="Local-First"
              description="All data stored on your device"
            />
            <FeatureItem
              icon="🔐"
              title="Encrypted"
              description="Military-grade AES-256 encryption"
            />
            <FeatureItem
              icon="🤖"
              title="AI-Powered"
              description="Smart organization and search"
            />
            <FeatureItem
              icon="🚫"
              title="Zero-Trust"
              description="No cloud, no tracking, no sharing"
            />
          </View>

          <Button
            title="Get Started"
            onPress={() => setStep(1)}
            size="large"
            style={styles.button}
            testID="get-started-button"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.title}>Create Your PIN</Text>
        <Text style={styles.subtitle}>
          This PIN will be used to encrypt all your documents. Choose wisely!
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter PIN (min. 4 digits)</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={8}
            placeholder="****"
            placeholderTextColor={COLORS.textMuted}
            data-testid="pin-input"
          />

          <Text style={styles.label}>Confirm PIN</Text>
          <TextInput
            style={styles.input}
            value={confirmPin}
            onChangeText={setConfirmPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={8}
            placeholder="****"
            placeholderTextColor={COLORS.textMuted}
            data-testid="confirm-pin-input"
          />
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Important: If you forget your PIN, there is NO way to recover
            your data. Write it down in a safe place.
          </Text>
        </View>

        <Button
          title="Create Vault"
          onPress={handleCreatePIN}
          loading={loading}
          size="large"
          style={styles.button}
          testID="create-vault-button"
        />
      </ScrollView>
    </View>
  );
};

const FeatureItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  features: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  button: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    letterSpacing: 8,
  },
  warning: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginBottom: SPACING.lg,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
