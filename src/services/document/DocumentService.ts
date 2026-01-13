// Document management service

import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import { DatabaseService } from '../database/DatabaseService';
import { EncryptionService } from '../encryption/EncryptionService';
import { OCRService } from '../ocr/OCRService';
import { AIService } from '../ai/AIService';
import { Document, DocumentType, DocumentMetadata } from '@types/index';

export class DocumentService {
  /**
   * Create new document
   */
  static async createDocument(
    filePath: string,
    title: string,
    type: DocumentType,
  ): Promise<Document> {
    try {
      const id = uuidv4();
      const now = new Date();

      // Get file info
      const fileStats = await RNFS.stat(filePath);
      const mimeType = this.getMimeType(filePath);

      // Encrypt file
      const encryptedData = await EncryptionService.encryptFile(filePath);
      if (!encryptedData) {
        throw new Error('File encryption failed');
      }

      const encryptedPath = `${RNFS.DocumentDirectoryPath}/encrypted/${id}.enc`;
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/encrypted`);
      await RNFS.writeFile(encryptedPath, encryptedData, 'utf8');

      // Extract text using OCR
      const ocrText = await OCRService.extractText(filePath);
      const entities = OCRService.extractEntities(ocrText);

      // AI suggestions
      const suggestedType = await AIService.suggestDocumentType(ocrText, entities);
      const suggestedExpiry = AIService.suggestExpiryDate(entities);
      const suggestedTags = AIService.suggestTags(ocrText, entities);

      // Create metadata
      const metadata: DocumentMetadata = {
        fileSize: parseInt(fileStats.size, 10),
        mimeType,
        extractedEntities: entities,
      };

      // Create document object
      const document: Document = {
        id,
        title,
        type: suggestedType?.value || type,
        filePath,
        encryptedPath,
        ocrText,
        metadata,
        tags: suggestedTags,
        createdAt: now,
        updatedAt: now,
        expiryDate: suggestedExpiry?.value,
        isFavorite: false,
        isArchived: false,
      };

      // Save to database
      DatabaseService.write(() => {
        DatabaseService.create('Document', {
          _id: new Realm.BSON.ObjectId(),
          ...document,
          metadata: JSON.stringify(metadata),
        });
      });

      return document;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  static getAllDocuments(): Document[] {
    try {
      const documents = DatabaseService.objects<any>('Document')
        .filtered('isArchived == false')
        .sorted('createdAt', true);

      return Array.from(documents).map(doc => ({
        ...doc,
        metadata: JSON.parse(doc.metadata),
        tags: Array.from(doc.tags),
      }));
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  /**
   * Get document by ID
   */
  static getDocumentById(id: string): Document | null {
    try {
      const doc = DatabaseService.objects<any>('Document').filtered(
        'id == $0',
        id,
      )[0];

      if (!doc) return null;

      return {
        ...doc,
        metadata: JSON.parse(doc.metadata),
        tags: Array.from(doc.tags),
      };
    } catch (error) {
      console.error('Failed to get document:', error);
      return null;
    }
  }

  /**
   * Update document
   */
  static updateDocument(id: string, updates: Partial<Document>): boolean {
    try {
      DatabaseService.write(() => {
        const doc = DatabaseService.objects<any>('Document').filtered(
          'id == $0',
          id,
        )[0];

        if (doc) {
          Object.keys(updates).forEach(key => {
            if (key === 'metadata') {
              doc[key] = JSON.stringify(updates[key]);
            } else if (key !== 'id') {
              doc[key] = updates[key as keyof Document];
            }
          });
          doc.updatedAt = new Date();
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      return false;
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: string): Promise<boolean> {
    try {
      const doc = this.getDocumentById(id);
      if (!doc) return false;

      // Delete encrypted file
      if (await RNFS.exists(doc.encryptedPath)) {
        await RNFS.unlink(doc.encryptedPath);
      }

      // Delete from database
      DatabaseService.write(() => {
        const dbDoc = DatabaseService.objects<any>('Document').filtered(
          'id == $0',
          id,
        )[0];
        if (dbDoc) {
          DatabaseService.delete(dbDoc);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  /**
   * Get decrypted file path (temporary)
   */
  static async getDecryptedFile(document: Document): Promise<string | null> {
    try {
      const encryptedData = await RNFS.readFile(document.encryptedPath, 'utf8');
      const tempPath = `${RNFS.CachesDirectoryPath}/${document.id}_temp${this.getExtension(document.filePath)}`;

      const success = await EncryptionService.decryptFile(encryptedData, tempPath);
      return success ? tempPath : null;
    } catch (error) {
      console.error('Failed to decrypt file:', error);
      return null;
    }
  }

  /**
   * Search documents
   */
  static searchDocuments(query: string): Document[] {
    try {
      const lowerQuery = query.toLowerCase();
      const documents = this.getAllDocuments();

      return documents.filter(
        doc =>
          doc.title.toLowerCase().includes(lowerQuery) ||
          doc.ocrText.toLowerCase().includes(lowerQuery) ||
          doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
      );
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Get MIME type from file path
   */
  private static getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Get file extension
   */
  private static getExtension(filePath: string): string {
    const parts = filePath.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }
}
