// Database service using Realm with encryption

import Realm from 'realm';
import { schemas } from '@models/schemas';
import { EncryptionService } from '../encryption/EncryptionService';

export class DatabaseService {
  private static realm: Realm | null = null;

  /**
   * Initialize encrypted Realm database
   */
  static async initialize(): Promise<boolean> {
    try {
      const encryptionKey = EncryptionService.getRealmEncryptionKey();
      if (!encryptionKey) {
        throw new Error('Encryption key not available');
      }

      this.realm = await Realm.open({
        schema: schemas,
        schemaVersion: 1,
        encryptionKey: new Int8Array(encryptionKey),
        path: 'vault.realm',
      });

      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  /**
   * Get Realm instance
   */
  static getInstance(): Realm {
    if (!this.realm) {
      throw new Error('Database not initialized');
    }
    return this.realm;
  }

  /**
   * Close database
   */
  static close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }

  /**
   * Write transaction
   */
  static write(callback: () => void): void {
    const realm = this.getInstance();
    realm.write(callback);
  }

  /**
   * Query objects
   */
  static objects<T>(type: string): Realm.Results<T & Realm.Object> {
    const realm = this.getInstance();
    return realm.objects<T>(type);
  }

  /**
   * Create object
   */
  static create<T>(
    type: string,
    properties: T,
    updateMode?: Realm.UpdateMode,
  ): T & Realm.Object {
    const realm = this.getInstance();
    return realm.create<T>(type, properties, updateMode);
  }

  /**
   * Delete object
   */
  static delete(object: Realm.Object): void {
    const realm = this.getInstance();
    realm.delete(object);
  }

  /**
   * Delete all objects of a type
   */
  static deleteAll(type: string): void {
    const realm = this.getInstance();
    const objects = realm.objects(type);
    realm.delete(objects);
  }
}
