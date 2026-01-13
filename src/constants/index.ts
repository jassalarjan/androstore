// Application constants

export const COLORS = {
  // Dark theme (primary)
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  text: '#F5F5F5',
  textSecondary: '#A1A1A1',
  textMuted: '#737373',
  border: '#2A2A2A',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const DOCUMENT_TYPES = [
  { value: 'ID', label: 'ID Card', icon: 'card' },
  { value: 'PASSPORT', label: 'Passport', icon: 'passport' },
  { value: 'CERTIFICATE', label: 'Certificate', icon: 'certificate' },
  { value: 'BILL', label: 'Bill', icon: 'receipt' },
  { value: 'RECEIPT', label: 'Receipt', icon: 'receipt' },
  { value: 'CONTRACT', label: 'Contract', icon: 'file-document' },
  { value: 'MEDICAL', label: 'Medical', icon: 'medical-bag' },
  { value: 'INSURANCE', label: 'Insurance', icon: 'shield' },
  { value: 'TAX', label: 'Tax Document', icon: 'file-chart' },
  { value: 'OTHER', label: 'Other', icon: 'file' },
];

export const TAG_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export const AUTO_LOCK_OPTIONS = [
  { label: 'Immediate', value: 0 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: 'Never', value: -1 },
];

export const OCR_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
];

export const ENCRYPTION_CONFIG = {
  algorithm: 'AES-256-GCM',
  keySize: 256,
  iterations: 100000,
  saltSize: 32,
  ivSize: 16,
};

export const DATABASE_CONFIG = {
  schemaVersion: 1,
  path: 'vault.realm',
  encryptionKey: null as ArrayBuffer | null,
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
export const SUPPORTED_DOCUMENT_FORMATS = ['pdf', ...SUPPORTED_IMAGE_FORMATS];
