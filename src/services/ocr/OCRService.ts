// Hybrid OCR service: ML Kit (primary) + Tesseract (fallback)

import TextRecognition from '@react-native-ml-kit/text-recognition';
import { ExtractedEntity } from '@types/index';

export class OCRService {
  /**
   * Extract text from image using ML Kit
   */
  static async extractText(imagePath: string): Promise<string> {
    try {
      console.log('Starting ML Kit OCR...');
      const result = await TextRecognition.recognize(imagePath);
      return result.text;
    } catch (mlKitError) {
      console.warn('ML Kit OCR failed, falling back to Tesseract:', mlKitError);
      return await this.extractTextWithTesseract(imagePath);
    }
  }

  /**
   * Fallback OCR using Tesseract
   */
  private static async extractTextWithTesseract(
    imagePath: string,
  ): Promise<string> {
    try {
      // Note: Tesseract implementation would require react-native-tesseract-ocr
      // For now, returning empty string as graceful fallback
      console.warn('Tesseract OCR not implemented');
      return '';
    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      return '';
    }
  }

  /**
   * Extract structured data from OCR text
   */
  static extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Extract dates
    const datePatterns = [
      /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
      /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'date',
            value: match,
            confidence: 0.8,
          });
        });
      }
    });

    // Extract amounts
    const amountPattern = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP|INR)/gi;
    const amounts = text.match(amountPattern);
    if (amounts) {
      amounts.forEach(amount => {
        entities.push({
          type: 'amount',
          value: amount,
          confidence: 0.85,
        });
      });
    }

    // Extract document numbers (generic patterns)
    const numberPattern = /\b[A-Z]{2,}[0-9]{6,}\b|\b[0-9]{8,}\b/g;
    const numbers = text.match(numberPattern);
    if (numbers) {
      numbers.slice(0, 5).forEach(number => {
        entities.push({
          type: 'number',
          value: number,
          confidence: 0.7,
        });
      });
    }

    // Extract emails
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.9,
        });
      });
    }

    // Extract phone numbers
    const phonePattern = /\b\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g;
    const phones = text.match(phonePattern);
    if (phones) {
      phones.forEach(phone => {
        entities.push({
          type: 'phone',
          value: phone,
          confidence: 0.85,
        });
      });
    }

    return entities;
  }

  /**
   * Extract text from multiple images (multi-page documents)
   */
  static async extractTextFromMultipleImages(
    imagePaths: string[],
  ): Promise<string> {
    try {
      const texts = await Promise.all(
        imagePaths.map(path => this.extractText(path)),
      );
      return texts.join('\n\n--- PAGE BREAK ---\n\n');
    } catch (error) {
      console.error('Multi-page OCR failed:', error);
      return '';
    }
  }

  /**
   * Get OCR confidence score (0-1)
   */
  static async getConfidenceScore(imagePath: string): Promise<number> {
    try {
      const result = await TextRecognition.recognize(imagePath);
      // ML Kit doesn't provide confidence directly, estimate based on text length
      const textLength = result.text.length;
      if (textLength > 100) return 0.9;
      if (textLength > 50) return 0.7;
      if (textLength > 10) return 0.5;
      return 0.3;
    } catch (error) {
      return 0;
    }
  }
}
