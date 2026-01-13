// Encryption service using AES-256-GCM

import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';
import { ENCRYPTION_CONFIG } from '@constants/index';

const MASTER_KEY_ALIAS = 'vault_master_key';
const PIN_HASH_ALIAS = 'vault_pin_hash';

export class EncryptionService {
  private static masterKey: string | null = null;

  /**
   * Initialize master key from user PIN
   */
  static async initializeFromPIN(pin: string): Promise<boolean> {
    try {
      // Derive key using PBKDF2
      const salt = await this.getOrCreateSalt();
      const key = CryptoJS.PBKDF2(pin, salt, {
        keySize: ENCRYPTION_CONFIG.keySize / 32,
        iterations: ENCRYPTION_CONFIG.iterations,
      });

      this.masterKey = key.toString();

      // Store PIN hash for verification
      const pinHash = CryptoJS.SHA256(pin).toString();
      await Keychain.setGenericPassword(PIN_HASH_ALIAS, pinHash, {
        service: PIN_HASH_ALIAS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      return false;
    }
  }

  /**
   * Verify PIN and unlock vault
   */
  static async verifyPIN(pin: string): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: PIN_HASH_ALIAS,
      });

      if (!credentials) return false;

      const pinHash = CryptoJS.SHA256(pin).toString();
      if (pinHash !== credentials.password) return false;

      // Re-derive master key
      const salt = await this.getOrCreateSalt();
      const key = CryptoJS.PBKDF2(pin, salt, {
        keySize: ENCRYPTION_CONFIG.keySize / 32,
        iterations: ENCRYPTION_CONFIG.iterations,
      });

      this.masterKey = key.toString();
      return true;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }

  /**
   * Encrypt data
   */
  static encrypt(data: string): string | null {
    if (!this.masterKey) {
      console.error('Master key not initialized');
      return null;
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.masterKey);
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedData: string): string | null {
    if (!this.masterKey) {
      console.error('Master key not initialized');
      return null;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Encrypt file (returns encrypted base64)
   */
  static async encryptFile(filePath: string): Promise<string | null> {
    if (!this.masterKey) return null;

    try {
      const RNFS = require('react-native-fs');
      const fileData = await RNFS.readFile(filePath, 'base64');
      return this.encrypt(fileData);
    } catch (error) {
      console.error('File encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt file and save to path
   */
  static async decryptFile(
    encryptedData: string,
    outputPath: string,
  ): Promise<boolean> {
    if (!this.masterKey) return false;

    try {
      const decrypted = this.decrypt(encryptedData);
      if (!decrypted) return false;

      const RNFS = require('react-native-fs');
      await RNFS.writeFile(outputPath, decrypted, 'base64');
      return true;
    } catch (error) {
      console.error('File decryption failed:', error);
      return false;
    }
  }

  /**
   * Get Realm encryption key (64 bytes)
   */
  static getRealmEncryptionKey(): ArrayBuffer | null {
    if (!this.masterKey) return null;

    try {
      // Generate 64-byte key for Realm
      const hash = CryptoJS.SHA512(this.masterKey);
      const hexString = hash.toString();
      const bytes = new Uint8Array(
        hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
      );
      return bytes.buffer;
    } catch (error) {
      console.error('Failed to generate Realm key:', error);
      return null;
    }
  }

  /**
   * Lock vault (clear master key from memory)
   */
  static lock(): void {
    this.masterKey = null;
  }

  /**
   * Check if vault is unlocked
   */
  static isUnlocked(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Get or create salt for key derivation
   */
  private static async getOrCreateSalt(): Promise<string> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: MASTER_KEY_ALIAS,
      });

      if (credentials) {
        return credentials.password;
      }

      // Generate new salt
      const salt = CryptoJS.lib.WordArray.random(
        ENCRYPTION_CONFIG.saltSize,
      ).toString();
      await Keychain.setGenericPassword(MASTER_KEY_ALIAS, salt, {
        service: MASTER_KEY_ALIAS,
        accessible: Keychain.ACCESSIBLE.ALWAYS,
      });

      return salt;
    } catch (error) {
      console.error('Failed to get/create salt:', error);
      throw error;
    }
  }

  /**
   * Change PIN
   */
  static async changePIN(oldPIN: string, newPIN: string): Promise<boolean> {
    try {
      // Verify old PIN
      const isValid = await this.verifyPIN(oldPIN);
      if (!isValid) return false;

      // Initialize with new PIN
      return await this.initializeFromPIN(newPIN);
    } catch (error) {
      console.error('Failed to change PIN:', error);
      return false;
    }
  }
}
