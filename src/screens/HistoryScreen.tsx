import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import * as historyRepository from '../storage/historyRepository';
import type { HistoryLog, HistoryActionType } from '../types';

const ACTION_COLORS: Record<HistoryActionType, string> = {
  created: '#10b981',
  edited: '#3b82f6',
  status_changed: '#f59e0b',
  attachment_added: '#8b5cf6',
  attachment_removed: '#ef4444',
  deleted: '#ef4444',
  synced: '#06b6d4',
};

export default function HistoryScreen() {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const data = await historyRepository.getAllLogs();
      setLogs(data);
    } catch {
      // Silently handle error - could add error state if needed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
  }, [loadLogs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (actionType: HistoryActionType) => {
    return actionType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderLog = ({ item }: { item: HistoryLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={[styles.actionBadge, { backgroundColor: ACTION_COLORS[item.actionType] }]}>
          <Text style={styles.actionText}>{getActionLabel(item.actionType)}</Text>
        </View>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📜</Text>
      <Text style={styles.emptyTitle}>No history yet</Text>
      <Text style={styles.emptySubtitle}>Task actions will appear here</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={logs.length === 0 ? styles.emptyContainer : styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
