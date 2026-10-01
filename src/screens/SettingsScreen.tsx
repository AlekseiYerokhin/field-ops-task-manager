import { StyleSheet, Switch, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore, useSettingsStore } from '../store';
import { useThemeColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const CANDIDATE_CODE = 'SA-RN-7429';

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, toggleTheme } = useThemeStore();
  const { demoMode, setDemoMode } = useSettingsStore();
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
        <Text style={styles.sectionTitle}>Navigation</Text>
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
  });
}
