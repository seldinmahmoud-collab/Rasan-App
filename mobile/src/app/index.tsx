import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import WelcomeLanding, { WELCOME_COMPLETED_KEY } from '../components/WelcomeLanding';
import { homeColors as palette } from '../theme';

export default function EntryScreen() {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(WELCOME_COMPLETED_KEY).then((value) => {
      if (!active) return;
      if (value === 'true') {
        router.replace('/(tabs)');
      } else {
        setShowWelcome(true);
      }
    }).catch((error: unknown) => {
      if (!active) return;
      setShowWelcome(true);
      Alert.alert(
        'Welcome preference',
        `Could not read the saved welcome preference. Showing the welcome screen. ${error instanceof Error ? error.message : String(error)}`,
      );
    });
    return () => { active = false; };
  }, []);

  if (showWelcome !== true) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.gold} />
      </View>
    );
  }
  return <WelcomeLanding />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.deep },
});
