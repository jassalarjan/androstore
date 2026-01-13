// AI Service using HuggingFace models

import { AIsuggestion, DocumentType, ExtractedEntity } from '@types/index';

export class AIService {
  private static isInitialized = false;
  private static pipeline: any = null;

  /**
   * Initialize HuggingFace transformers
   */
  static async initialize(): Promise<boolean> {
    try {
      // Note: For production, use @xenova/transformers for on-device inference
      // or HuggingFace Inference API for cloud processing
      
      console.log('AI Service initialized (stub mode)');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }

  /**
   * Suggest document type based on OCR text
   */
  static async suggestDocumentType(
    text: string,
    entities: ExtractedEntity[],
  ): Promise<AIsuggestion | null> {
    try {
      const textLower = text.toLowerCase();

      // Rule-based classification (can be enhanced with ML)
      if (textLower.includes('passport') || textLower.includes('travel document')) {
        return {
          type: 'documentType',
          confidence: 0.9,
          value: DocumentType.PASSPORT,
        };
      }

      if (textLower.includes('driver') && textLower.includes('license')) {
        return {
          type: 'documentType',
          confidence: 0.85,
          value: DocumentType.ID,
        };
      }

      if (textLower.includes('invoice') || textLower.includes('bill')) {
        return {
          type: 'documentType',
          confidence: 0.8,
          value: DocumentType.BILL,
        };
      }

      if (textLower.includes('certificate')) {
        return {
          type: 'documentType',
          confidence: 0.85,
          value: DocumentType.CERTIFICATE,
        };
      }

      if (textLower.includes('insurance') || textLower.includes('policy')) {
        return {
          type: 'documentType',
          confidence: 0.8,
          value: DocumentType.INSURANCE,
        };
      }

      return null;
    } catch (error) {
      console.error('Document type suggestion failed:', error);
      return null;
    }
  }

  /**
   * Extract and suggest expiry date
   */
  static suggestExpiryDate(entities: ExtractedEntity[]): AIsuggestion | null {
    try {
      const dateEntities = entities.filter(e => e.type === 'date');
      if (dateEntities.length === 0) return null;

      // Find the latest date (likely expiry)
      const dates = dateEntities
        .map(e => new Date(e.value))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

      if (dates.length > 0) {
        return {
          type: 'expiry',
          confidence: 0.7,
          value: dates[0],
        };
      }

      return null;
    } catch (error) {
      console.error('Expiry date suggestion failed:', error);
      return null;
    }
  }

  /**
   * Generate document summary
   */
  static async summarizeDocument(text: string): Promise<string> {
    try {
      // For production: Use HuggingFace summarization model
      // For now: Extract first few sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      return summary.substring(0, 200);
    } catch (error) {
      console.error('Summarization failed:', error);
      return text.substring(0, 200);
    }
  }

  /**
   * Suggest related documents based on content similarity
   */
  static async suggestRelatedDocuments(
    currentText: string,
    allDocuments: Array<{ id: string; text: string; title: string }>,
  ): Promise<AIsuggestion[]> {
    try {
      const suggestions: AIsuggestion[] = [];

      // Simple keyword-based similarity
      const currentKeywords = this.extractKeywords(currentText);

      allDocuments.forEach(doc => {
        const docKeywords = this.extractKeywords(doc.text);
        const similarity = this.calculateSimilarity(currentKeywords, docKeywords);

        if (similarity > 0.3) {
          suggestions.push({
            type: 'link',
            confidence: similarity,
            value: doc.id,
            metadata: { title: doc.title },
          });
        }
      });

      return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    } catch (error) {
      console.error('Related documents suggestion failed:', error);
      return [];
    }
  }

  /**
   * Suggest tags based on content
   */
  static suggestTags(text: string, entities: ExtractedEntity[]): string[] {
    const tags: Set<string> = new Set();
    const textLower = text.toLowerCase();

    // Common document tags
    const tagKeywords = {
      medical: ['health', 'medical', 'doctor', 'hospital', 'prescription'],
      financial: ['bank', 'payment', 'invoice', 'tax', 'receipt'],
      legal: ['contract', 'agreement', 'legal', 'court', 'attorney'],
      personal: ['id', 'passport', 'license', 'birth', 'marriage'],
      work: ['employment', 'salary', 'company', 'job', 'work'],
      education: ['certificate', 'degree', 'school', 'university', 'course'],
    };

    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        tags.add(tag);
      }
    });

    return Array.from(tags);
  }

  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): Set<string> {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    // Remove common words
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    ]);

    return new Set(words.filter(w => !stopWords.has(w)));
  }

  /**
   * Calculate similarity between two keyword sets
   */
  private static calculateSimilarity(
    set1: Set<string>,
    set2: Set<string>,
  ): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Generate smart search query suggestions
   */
  static async suggestSearchQueries(query: string): Promise<string[]> {
    // Simple query expansion
    const suggestions: string[] = [];
    const words = query.toLowerCase().split(/\s+/);

    // Add partial matches
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      // In production, use a proper autocomplete model
      suggestions.push(query + ' document');
      suggestions.push(query + ' certificate');
    }

    return suggestions.slice(0, 5);
  }
}
