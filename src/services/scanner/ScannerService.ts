// Document scanning service using Vision Camera

import { Camera } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { OCRService } from '../ocr/OCRService';

export class ScannerService {
  /**
   * Request camera permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await Camera.requestCameraPermission();
      return cameraPermission === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Check if camera permission is granted
   */
  static async hasPermissions(): Promise<boolean> {
    const status = await Camera.getCameraPermissionStatus();
    return status === 'granted';
  }

  /**
   * Process captured image
   */
  static async processScannedImage(imagePath: string): Promise<{
    text: string;
    enhancedPath: string;
  }> {
    try {
      // Enhance image quality (basic)
      const enhancedPath = await this.enhanceImage(imagePath);

      // Extract text using OCR
      const text = await OCRService.extractText(enhancedPath);

      return {
        text,
        enhancedPath,
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  }

  /**
   * Basic image enhancement
   */
  private static async enhanceImage(imagePath: string): Promise<string> {
    try {
      // For production, implement image enhancement:
      // - Auto-rotation
      // - Perspective correction
      // - Brightness/contrast adjustment
      // - Noise reduction

      // For now, return original path
      // TODO: Integrate react-native-image-filter-kit or similar
      return imagePath;
    } catch (error) {
      console.error('Image enhancement failed:', error);
      return imagePath;
    }
  }

  /**
   * Detect document edges (for auto-crop)
   */
  static async detectDocumentEdges(imagePath: string): Promise<{
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  } | null> {
    try {
      // TODO: Implement edge detection using OpenCV or similar
      // For now, return null (no auto-crop)
      return null;
    } catch (error) {
      console.error('Edge detection failed:', error);
      return null;
    }
  }

  /**
   * Save scanned image to secure storage
   */
  static async saveScannedImage(
    sourcePath: string,
    fileName: string,
  ): Promise<string> {
    try {
      const destinationPath = `${RNFS.DocumentDirectoryPath}/scans/${fileName}`;
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/scans`);
      await RNFS.copyFile(sourcePath, destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('Failed to save scanned image:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for document
   */
  static async generateThumbnail(
    imagePath: string,
    size: number = 200,
  ): Promise<string> {
    try {
      // TODO: Implement thumbnail generation
      // For now, use original image
      const thumbnailPath = imagePath.replace(
        /\.(jpg|jpeg|png)$/,
        '_thumb.$1',
      );
      await RNFS.copyFile(imagePath, thumbnailPath);
      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return imagePath;
    }
  }
}
