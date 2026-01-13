// Unified search service across documents, notes, and chat

import { SearchResult } from '@types/index';
import { DocumentService } from '../document/DocumentService';
import { DatabaseService } from '../database/DatabaseService';

export class SearchService {
  /**
   * Unified search across all content
   */
  static async search(query: string): Promise<{
    documents: SearchResult[];
    notes: SearchResult[];
    chat: SearchResult[];
  }> {
    const startTime = Date.now();

    try {
      const lowerQuery = query.toLowerCase();

      // Search documents
      const documents = this.searchDocuments(lowerQuery);

      // Search notes
      const notes = this.searchNotes(lowerQuery);

      // Search chat messages
      const chat = this.searchChat(lowerQuery);

      const endTime = Date.now();
      console.log(`Search completed in ${endTime - startTime}ms`);

      return { documents, notes, chat };
    } catch (error) {
      console.error('Search failed:', error);
      return { documents: [], notes: [], chat: [] };
    }
  }

  /**
   * Search documents
   */
  private static searchDocuments(query: string): SearchResult[] {
    try {
      const allDocs = DocumentService.getAllDocuments();
      const results: SearchResult[] = [];

      allDocs.forEach(doc => {
        let relevance = 0;
        let snippet = '';

        // Check title
        if (doc.title.toLowerCase().includes(query)) {
          relevance += 0.5;
          snippet = doc.title;
        }

        // Check OCR text
        const textLower = doc.ocrText.toLowerCase();
        const queryIndex = textLower.indexOf(query);
        if (queryIndex !== -1) {
          relevance += 0.3;
          // Extract snippet around match
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(doc.ocrText.length, queryIndex + 100);
          snippet = '...' + doc.ocrText.substring(start, end) + '...';
        }

        // Check tags
        if (doc.tags.some(tag => tag.toLowerCase().includes(query))) {
          relevance += 0.2;
        }

        if (relevance > 0) {
          results.push({
            type: 'document',
            id: doc.id,
            title: doc.title,
            snippet: snippet || doc.ocrText.substring(0, 100),
            relevance,
            timestamp: doc.createdAt,
          });
        }
      });

      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('Document search failed:', error);
      return [];
    }
  }

  /**
   * Search notes
   */
  private static searchNotes(query: string): SearchResult[] {
    try {
      const allNotes = DatabaseService.objects<any>('Note').sorted(
        'createdAt',
        true,
      );
      const results: SearchResult[] = [];

      allNotes.forEach(note => {
        let relevance = 0;
        let snippet = '';

        // Check title
        if (note.title.toLowerCase().includes(query)) {
          relevance += 0.5;
          snippet = note.title;
        }

        // Check content
        const contentLower = note.content.toLowerCase();
        const queryIndex = contentLower.indexOf(query);
        if (queryIndex !== -1) {
          relevance += 0.4;
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(note.content.length, queryIndex + 100);
          snippet = '...' + note.content.substring(start, end) + '...';
        }

        // Check tags
        if (Array.from(note.tags).some(tag => tag.toLowerCase().includes(query))) {
          relevance += 0.1;
        }

        if (relevance > 0) {
          results.push({
            type: 'note',
            id: note.id,
            title: note.title,
            snippet: snippet || note.content.substring(0, 100),
            relevance,
            timestamp: note.createdAt,
          });
        }
      });

      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('Notes search failed:', error);
      return [];
    }
  }

  /**
   * Search chat messages
   */
  private static searchChat(query: string): SearchResult[] {
    try {
      const allMessages = DatabaseService.objects<any>('ChatMessage').sorted(
        'timestamp',
        true,
      );
      const results: SearchResult[] = [];

      allMessages.forEach(msg => {
        const contentLower = msg.content.toLowerCase();
        if (contentLower.includes(query)) {
          const queryIndex = contentLower.indexOf(query);
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(msg.content.length, queryIndex + 100);
          const snippet = '...' + msg.content.substring(start, end) + '...';

          results.push({
            type: 'chat',
            id: msg.id,
            title: msg.content.substring(0, 50),
            snippet,
            relevance: 0.3,
            timestamp: msg.timestamp,
          });
        }
      });

      return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Chat search failed:', error);
      return [];
    }
  }

  /**
   * Get recent searches (for autocomplete)
   */
  static getRecentSearches(): string[] {
    // TODO: Implement search history storage
    return [];
  }

  /**
   * Save search query to history
   */
  static saveSearchQuery(query: string): void {
    // TODO: Implement search history storage
  }
}
