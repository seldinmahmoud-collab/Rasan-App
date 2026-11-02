import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { NotoSansArabic_400Regular } from '@expo-google-fonts/noto-sans-arabic/400Regular';
import { NotoSansArabic_500Medium } from '@expo-google-fonts/noto-sans-arabic/500Medium';
import { NotoSansArabic_600SemiBold } from '@expo-google-fonts/noto-sans-arabic/600SemiBold';
import { NotoSansArabic_700Bold } from '@expo-google-fonts/noto-sans-arabic/700Bold';
import { AppSettingsProvider } from '../context/AppSettings';
import { ShopCartProvider } from '../context/ShopCart';
import { colors } from '../theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'RasanDisplay-Regular': CormorantGaramond_400Regular,
    'RasanDisplay-Medium': CormorantGaramond_500Medium,
    'RasanDisplay-SemiBold': CormorantGaramond_600SemiBold,
    'RasanDisplay-Bold': CormorantGaramond_700Bold,
    'RasanSans-Regular': Inter_400Regular,
    'RasanSans-Medium': Inter_500Medium,
    'RasanSans-SemiBold': Inter_600SemiBold,
    'RasanSans-Bold': Inter_700Bold,
    'RasanArabic-Regular': NotoSansArabic_400Regular,
    'RasanArabic-Medium': NotoSansArabic_500Medium,
    'RasanArabic-SemiBold': NotoSansArabic_600SemiBold,
    'RasanArabic-Bold': NotoSansArabic_700Bold,
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <ShopCartProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="horses/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="cart" options={{ presentation: 'card' }} />
          </Stack>
        </ShopCartProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}