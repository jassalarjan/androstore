// Realm database schemas

import Realm from 'realm';

export class DocumentSchema extends Realm.Object<DocumentSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  title!: string;
  type!: string;
  filePath!: string;
  encryptedPath!: string;
  thumbnailPath?: string;
  ocrText!: string;
  metadata!: string; // JSON string
  tags!: Realm.List<string>;
  createdAt!: Date;
  updatedAt!: Date;
  expiryDate?: Date;
  isFavorite!: boolean;
  isArchived!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Document',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: { type: 'string', indexed: true },
      title: 'string',
      type: 'string',
      filePath: 'string',
      encryptedPath: 'string',
      thumbnailPath: 'string?',
      ocrText: 'string',
      metadata: 'string',
      tags: 'string[]',
      createdAt: 'date',
      updatedAt: 'date',
      expiryDate: 'date?',
      isFavorite: { type: 'bool', default: false },
      isArchived: { type: 'bool', default: false },
    },
  };
}

export class NoteSchema extends Realm.Object<NoteSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  title!: string;
  content!: string;
  linkedDocuments!: Realm.List<string>;
  linkedNotes!: Realm.List<string>;
  tags!: Realm.List<string>;
  createdAt!: Date;
  updatedAt!: Date;
  isFavorite!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Note',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: { type: 'string', indexed: true },
      title: 'string',
      content: 'string',
      linkedDocuments: 'string[]',
      linkedNotes: 'string[]',
      tags: 'string[]',
      createdAt: 'date',
      updatedAt: 'date',
      isFavorite: { type: 'bool', default: false },
    },
  };
}

export class ChatMessageSchema extends Realm.Object<ChatMessageSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  content!: string;
  attachments!: Realm.List<string>;
  timestamp!: Date;
  isNote!: boolean;
  noteId?: string;

  static schema: Realm.ObjectSchema = {
    name: 'ChatMessage',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: { type: 'string', indexed: true },
      content: 'string',
      attachments: 'string[]',
      timestamp: 'date',
      isNote: { type: 'bool', default: false },
      noteId: 'string?',
    },
  };
}

export class TagSchema extends Realm.Object<TagSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  name!: string;
  color!: string;
  documentCount!: number;
  noteCount!: number;

  static schema: Realm.ObjectSchema = {
    name: 'Tag',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: { type: 'string', indexed: true },
      name: { type: 'string', indexed: true },
      color: 'string',
      documentCount: { type: 'int', default: 0 },
      noteCount: { type: 'int', default: 0 },
    },
  };
}

export const schemas = [
  DocumentSchema,
  NoteSchema,
  ChatMessageSchema,
  TagSchema,
];
