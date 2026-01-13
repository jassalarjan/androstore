// Search screen with unified results

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SearchBar } from '@components/SearchBar';
import { SearchService } from '@services/search/SearchService';
import { SearchResult } from '@types/index';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';
import { format } from 'date-fns';

interface SearchScreenProps {
  navigation: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    documents: SearchResult[];
    notes: SearchResult[];
    chat: SearchResult[];
  }>({ documents: [], notes: [], chat: [] });
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (query.length > 1) {
      performSearch();
    } else {
      setResults({ documents: [], notes: [], chat: [] });
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const searchResults = await SearchService.search(query);
      setResults(searchResults);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'document') {
      navigation.navigate('DocumentViewer', { documentId: result.id });
    } else if (result.type === 'note') {
      navigation.navigate('NoteEditor', { noteId: result.id });
    } else if (result.type === 'chat') {
      navigation.navigate('Chat', { messageId: result.id });
    }
  };

  const totalResults =
    results.documents.length + results.notes.length + results.chat.length;

  return (
    <View style={styles.container} data-testid="search-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search everything..."
            testID="search-input"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : query.length > 1 ? (
          <>
            <View style={styles.resultStats}>
              <Text style={styles.resultCount}>
                {totalResults} results found in {searchTime}ms
              </Text>
            </View>

            {/* Documents */}
            {results.documents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  📄 Documents ({results.documents.length})
                </Text>
                {results.documents.map(result => (
                  <ResultItem
                    key={result.id}
                    result={result}
                    onPress={() => handleResultPress(result)}
                  />
                ))}
              </View>
            )}

            {/* Notes */}
            {results.notes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  📝 Notes ({results.notes.length})
                </Text>
                {results.notes.map(result => (
                  <ResultItem
                    key={result.id}
                    result={result}
                    onPress={() => handleResultPress(result)}
                  />
                ))}
              </View>
            )}

            {/* Chat */}
            {results.chat.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  💬 Messages ({results.chat.length})
                </Text>
                {results.chat.map(result => (
                  <ResultItem
                    key={result.id}
                    result={result}
                    onPress={() => handleResultPress(result)}
                  />
                ))}
              </View>
            )}

            {totalResults === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try different keywords
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>Start typing to search</Text>
            <Text style={styles.emptySubtext}>
              Search across documents, notes, and messages
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const ResultItem: React.FC<{
  result: SearchResult;
  onPress: () => void;
}> = ({ result, onPress }) => (
  <TouchableOpacity
    style={styles.resultItem}
    onPress={onPress}
    data-testid={`result-item-${result.id}`}>
    <Text style={styles.resultTitle} numberOfLines={1}>
      {result.title}
    </Text>
    <Text style={styles.resultSnippet} numberOfLines={2}>
      {result.snippet}
    </Text>
    <Text style={styles.resultDate}>
      {format(new Date(result.timestamp), 'MMM dd, yyyy')}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  backText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  searchContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  loading: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  resultStats: {
    marginBottom: SPACING.lg,
  },
  resultCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultSnippet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  resultDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  empty: {
    alignItems: 'center',
    padding: SPACING.xxl,
    marginTop: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
