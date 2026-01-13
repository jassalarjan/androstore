// Document Card component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Document, DOCUMENT_TYPES } from '@types/index';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  testID?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  testID,
}) => {
  const docType = DOCUMENT_TYPES.find(t => t.value === document.type);
  const isExpiringSoon =
    document.expiryDate &&
    new Date(document.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      data-testid={testID}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {document.thumbnailPath ? (
          <Image
            source={{ uri: document.thumbnailPath }}
            style={styles.thumbnailImage}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>📄</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title}
          </Text>
          {document.isFavorite && <Text style={styles.favorite}>⭐</Text>}
        </View>

        <Text style={styles.type}>{docType?.label || document.type}</Text>

        {document.expiryDate && (
          <Text style={[styles.expiry, isExpiringSoon && styles.expiryWarning]}>
            Expires: {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
          </Text>
        )}

        {/* Tags */}
        {document.tags.length > 0 && (
          <View style={styles.tags}>
            {document.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.date}>
          {format(new Date(document.createdAt), 'MMM dd, yyyy')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  favorite: {
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.xs,
  },
  type: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  expiry: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  expiryWarning: {
    color: COLORS.warning,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
