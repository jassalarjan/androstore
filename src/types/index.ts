// Core type definitions for the Document Vault

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  filePath: string;
  encryptedPath: string;
  thumbnailPath?: string;
  ocrText: string;
  metadata: DocumentMetadata;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  isFavorite: boolean;
  isArchived: boolean;
}

export enum DocumentType {
  ID = 'ID',
  PASSPORT = 'PASSPORT',
  CERTIFICATE = 'CERTIFICATE',
  BILL = 'BILL',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  MEDICAL = 'MEDICAL',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
  OTHER = 'OTHER',
}

export interface DocumentMetadata {
  issuer?: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  amount?: number;
  currency?: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  extractedEntities?: ExtractedEntity[];
}

export interface ExtractedEntity {
  type: 'date' | 'amount' | 'number' | 'name' | 'email' | 'phone';
  value: string;
  confidence: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedDocuments: string[]; // Document IDs
  linkedNotes: string[]; // Note IDs (bidirectional links)
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  attachments: string[]; // Document IDs
  timestamp: Date;
  isNote: boolean; // Converted to note
  noteId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  documentCount: number;
  noteCount: number;
}

export interface SearchResult {
  type: 'document' | 'note' | 'chat';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  timestamp: Date;
}

export interface AIsuggestion {
  type: 'documentType' | 'expiry' | 'link' | 'summary';
  confidence: number;
  value: any;
  metadata?: Record<string, any>;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockTimeout: number; // seconds
  screenshotBlocking: boolean;
  decoyVaultEnabled: boolean;
  masterKeySet: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: string;
  ocrLanguages: string[];
  cloudSyncEnabled: boolean;
  aiEnabled: boolean;
  securitySettings: SecuritySettings;
}
