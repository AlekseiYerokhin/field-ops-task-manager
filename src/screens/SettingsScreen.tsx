import { StyleSheet, Switch, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore, useSettingsStore, useSyncStore } from '../store';
import { syncPendingChanges } from '../services';
import { useThemeColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const CANDIDATE_CODE = 'SA-RN-7429';

const SYNC_STATUS_LABEL: Record<string, string> = {
  synced: 'Synced',
  pending: 'Pending Sync',
  failed: 'Sync Failed',
};

const SYNC_STATUS_COLOR: Record<string, string> = {
  synced: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
};

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, toggleTheme } = useThemeStore();
  const { demoMode, setDemoMode } = useSettingsStore();
  const { syncStatus, lastSyncTime } = useSyncStore();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            accessibilityLabel="Toggle dark mode"
            accessibilityRole="switch"
            accessibilityState={{ checked: theme === 'dark' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Demo Mode (30-60s)</Text>
          <Switch
            value={demoMode}
            onValueChange={setDemoMode}
            accessibilityLabel="Toggle notification demo mode"
            accessibilityRole="switch"
            accessibilityState={{ checked: demoMode }}
          />
        </View>
        <Text style={styles.settingDescription}>
          When enabled, task notifications trigger ~45 seconds after saving, so you can verify the
          flow without waiting 30 minutes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Status</Text>
          <View style={styles.syncStatusRow}>
            <View style={[styles.syncDot, { backgroundColor: SYNC_STATUS_COLOR[syncStatus] }]} />
            <Text style={styles.syncStatusText}>{SYNC_STATUS_LABEL[syncStatus]}</Text>
          </View>
        </View>
        {lastSyncTime && (
          <Text style={styles.settingDescription}>
            Last sync: {new Date(lastSyncTime).toLocaleString()}
          </Text>
        )}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => syncPendingChanges()}
          accessibilityRole="button"
          accessibilityLabel="Sync now"
        >
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Map')}
          accessibilityRole="button"
          accessibilityLabel="View task map"
        >
          <Text style={styles.settingLabel}>View Map</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('History')}
          accessibilityRole="button"
          accessibilityLabel="View history"
        >
          <Text style={styles.settingLabel}>View History</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Candidate Code</Text>
          <Text style={styles.candidateCode}>{CANDIDATE_CODE}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
    },
    settingValue: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 4,
      lineHeight: 18,
    },
    candidateCode: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    chevron: {
      fontSize: 24,
      color: colors.textTertiary,
    },
    syncStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    syncDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    syncStatusText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    syncButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    syncButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.surface,
    },
  });
}
