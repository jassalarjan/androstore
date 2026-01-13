// Scanner screen for capturing documents

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { ScannerService } from '@services/scanner/ScannerService';
import { DocumentService } from '@services/document/DocumentService';
import { Button } from '@components/Button';
import { useAppStore } from '@store/appStore';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';
import { DocumentType } from '@types/index';

interface ScannerScreenProps {
  navigation: any;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { setScanning } = useAppStore();

  React.useEffect(() => {
    checkPermissions();
    return () => setScanning(false);
  }, []);

  const checkPermissions = async () => {
    const hasPerms = await ScannerService.requestPermissions();
    setHasPermission(hasPerms);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    setScanning(true);

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
      });

      // Process image
      const { text, enhancedPath } = await ScannerService.processScannedImage(
        photo.path,
      );

      // Create document
      const document = await DocumentService.createDocument(
        enhancedPath,
        `Scanned Document ${new Date().toLocaleDateString()}`,
        DocumentType.OTHER,
      );

      Alert.alert(
        'Document Scanned',
        `Extracted ${text.length} characters`,
        [
          {
            text: 'View',
            onPress: () => {
              navigation.replace('DocumentViewer', { documentId: document.id });
            },
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ],
      );
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Scan Failed', 'Please try again');
    } finally {
      setIsProcessing(false);
      setScanning(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan documents
        </Text>
        <Button
          title="Grant Permission"
          onPress={checkPermissions}
          testID="grant-permission-button"
        />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} data-testid="scanner-screen">
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isProcessing}
        photo={true}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            data-testid="back-button">
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.corner} style={[styles.corner, styles.topLeft]} />
          <View style={styles.corner} style={[styles.corner, styles.topRight]} />
          <View style={styles.corner} style={[styles.corner, styles.bottomLeft]} />
          <View style={styles.corner} style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            Position document within the frame
          </Text>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={isProcessing}
            data-testid="capture-button">
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backText: {
    fontSize: FONT_SIZES.lg,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xxl,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  instruction: {
    fontSize: FONT_SIZES.md,
    color: '#FFFFFF',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  permissionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: FONT_SIZES.lg,
    color: '#FFFFFF',
    marginTop: SPACING.md,
  },
});
