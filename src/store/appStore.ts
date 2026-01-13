// Zustand store for app state management

import { create } from 'zustand';
import { Document, Note, ChatMessage, Tag, AppSettings, SecuritySettings } from '@types/index';

interface AppState {
  // Auth state
  isUnlocked: boolean;
  isFirstLaunch: boolean;
  setUnlocked: (unlocked: boolean) => void;
  setFirstLaunch: (isFirst: boolean) => void;

  // Documents
  documents: Document[];
  selectedDocument: Document | null;
  setDocuments: (docs: Document[]) => void;
  setSelectedDocument: (doc: Document | null) => void;

  // Notes
  notes: Note[];
  selectedNote: Note | null;
  setNotes: (notes: Note[]) => void;
  setSelectedNote: (note: Note | null) => void;

  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  // Tags
  tags: Tag[];
  setTags: (tags: Tag[]) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // UI state
  isScanning: boolean;
  setScanning: (scanning: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const defaultSecuritySettings: SecuritySettings = {
  biometricEnabled: false,
  autoLockTimeout: 300, // 5 minutes
  screenshotBlocking: true,
  decoyVaultEnabled: false,
  masterKeySet: false,
};

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  ocrLanguages: ['en'],
  cloudSyncEnabled: false,
  aiEnabled: true,
  securitySettings: defaultSecuritySettings,
};

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isUnlocked: false,
  isFirstLaunch: true,
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),

  // Documents
  documents: [],
  selectedDocument: null,
  setDocuments: (docs) => set({ documents: docs }),
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),

  // Notes
  notes: [],
  selectedNote: null,
  setNotes: (notes) => set({ notes: notes }),
  setSelectedNote: (note) => set({ selectedNote: note }),

  // Chat
  chatMessages: [],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  // Tags
  tags: [],
  setTags: (tags) => set({ tags: tags }),

  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  // UI
  isScanning: false,
  setScanning: (scanning) => set({ isScanning: scanning }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
