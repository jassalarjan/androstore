// Utility helper functions

import { format, formatDistance, differenceInDays } from 'date-fns';

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date to relative time or absolute date
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const daysDiff = differenceInDays(now, date);

  if (daysDiff < 7) {
    return formatDistance(date, now, { addSuffix: true });
  }

  return format(date, 'MMM dd, yyyy');
};

/**
 * Validate PIN format
 */
export const validatePIN = (pin: string): { valid: boolean; error?: string } => {
  if (pin.length < 4) {
    return { valid: false, error: 'PIN must be at least 4 digits' };
  }
  if (pin.length > 8) {
    return { valid: false, error: 'PIN must be at most 8 digits' };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN must contain only numbers' };
  }
  return { valid: true };
};

/**
 * Generate random color from predefined palette
 */
export const getRandomColor = (): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Check if document is expiring soon (within 30 days)
 */
export const isExpiringSoon = (expiryDate: Date | undefined): boolean => {
  if (!expiryDate) return false;
  const now = new Date();
  const diff = differenceInDays(expiryDate, now);
  return diff >= 0 && diff <= 30;
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = originalName.split('.').pop();
  return `${timestamp}_${random}.${ext}`;
};

/**
 * Sanitize filename (remove special characters)
 */
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
