// Dashboard screen - main hub

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { DocumentCard } from '@components/DocumentCard';
import { SearchBar } from '@components/SearchBar';
import { Button } from '@components/Button';
import { useAppStore } from '@store/appStore';
import { DocumentService } from '@services/document/DocumentService';
import { COLORS, SPACING, FONT_SIZES } from '@constants/index';
import { format } from 'date-fns';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const {
    documents,
    setDocuments,
    searchQuery,
    setSearchQuery,
    setSelectedDocument,
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    expiringSoon: 0,
    recent: 0,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = DocumentService.getAllDocuments();
      setDocuments(docs);

      // Calculate stats
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      const expiringSoon = docs.filter(
        doc =>
          doc.expiryDate &&
          new Date(doc.expiryDate).getTime() - now < thirtyDays,
      ).length;

      const recent = docs.filter(
        doc => now - new Date(doc.createdAt).getTime() < sevenDays,
      ).length;

      setStats({
        total: docs.length,
        expiringSoon,
        recent,
      });
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const handleDocumentPress = (doc: any) => {
    setSelectedDocument(doc);
    navigation.navigate('DocumentViewer');
  };

  const recentDocuments = documents.slice(0, 5);

  return (
    <View style={styles.container} data-testid="dashboard-screen">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.title}>Document Vault</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
          data-testid="settings-button">
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearch}
          testID="dashboard-search-bar"
        />

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="📄"
            label="Total Documents"
            value={stats.total.toString()}
          />
          <StatCard
            icon="⏰"
            label="Expiring Soon"
            value={stats.expiringSoon.toString()}
            warning={stats.expiringSoon > 0}
          />
          <StatCard
            icon="✨"
            label="Added This Week"
            value={stats.recent.toString()}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="📷"
              label="Scan Document"
              onPress={() => navigation.navigate('Scanner')}
              testID="scan-action-button"
            />
            <ActionButton
              icon="📂"
              label="Import File"
              onPress={() => navigation.navigate('Import')}
              testID="import-action-button"
            />
            <ActionButton
              icon="📝"
              label="New Note"
              onPress={() => navigation.navigate('Notes')}
              testID="note-action-button"
            />
            <ActionButton
              icon="💬"
              label="Self-Chat"
              onPress={() => navigation.navigate('Chat')}
              testID="chat-action-button"
            />
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Documents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Documents')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentDocuments.length > 0 ? (
            recentDocuments.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPress={() => handleDocumentPress(doc)}
                testID={`document-card-${doc.id}`}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No documents yet</Text>
              <Text style={styles.emptySubtext}>
                Scan or import your first document
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Scanner')}
        data-testid="fab-scan-button">
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>
    </View>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  warning?: boolean;
}> = ({ icon, label, value, warning = false }) => (
  <View style={[styles.statCard, warning && styles.statCardWarning]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
}> = ({ icon, label, onPress, testID }) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
    data-testid={testID}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  settingsIcon: {
    fontSize: FONT_SIZES.xl,
  },
  content: {
    padding: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardWarning: {
    borderColor: COLORS.warning,
  },
  statIcon: {
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
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
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
  },
});
