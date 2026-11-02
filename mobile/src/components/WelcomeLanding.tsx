import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TypographyText as Text } from './TypographyText';
import { useAppSettings } from '../context/AppSettings';
import { homeColors as palette, spacing } from '../theme';

export const WELCOME_COMPLETED_KEY = '@rasan/welcome-completed-v1';

export default function WelcomeLanding() {
  const { t, locale, setLocale } = useAppSettings();
  const { height } = useWindowDimensions();
  const [entering, setEntering] = useState(false);
  const compact = height < 740;

  const enterMarketplace = async () => {
    if (entering) return;
    setEntering(true);
    try {
      await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      setEntering(false);
      Alert.alert(
        t('welcomeStorageErrorTitle'),
        `${t('welcomeStorageErrorNote')} ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const showAuthUnavailable = (action: 'signIn' | 'joinRasan') => {
    Alert.alert(t(action), t('authNotConnected'));
  };

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/file_0000000092ac82468fe5b28519dddfc7.png')}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.backgroundImage}
        accessible
        accessibilityLabel={t('illustrativePhotography')}
      />
      <LinearGradient
        colors={['rgba(4, 17, 12, 0.04)', 'rgba(4, 17, 12, 0.08)', 'rgba(4, 17, 12, 0.3)', 'rgba(4, 17, 12, 0.92)']}
        locations={[0, 0.38, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(217, 182, 117, 0.08)', 'rgba(6, 41, 28, 0.02)', 'rgba(6, 41, 28, 0.24)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={[styles.languageRow, locale === 'ar' && styles.rowReverse]}>
          <View style={styles.languagePill}>
            <Pressable
              onPress={() => setLocale('ar')}
              accessibilityRole="button"
              accessibilityLabel="العربية"
              accessibilityState={{ selected: locale === 'ar' }}
              style={[styles.languageOption, locale === 'ar' && styles.languageOptionSelected]}
            >
              <Text style={[styles.languageText, locale === 'ar' && styles.languageTextSelected]}>العربية</Text>
            </Pressable>
            <View style={styles.languageDivider} />
            <Pressable
              onPress={() => setLocale('en')}
              accessibilityRole="button"
              accessibilityLabel="English"
              accessibilityState={{ selected: locale === 'en' }}
              style={[styles.languageOption, locale === 'en' && styles.languageOptionSelected]}
            >
              <Text style={[styles.languageText, locale === 'en' && styles.languageTextSelected]}>EN</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.content, compact && styles.compactContent]}>
          <View style={styles.lowerContent}>
            <View style={styles.brandBlock}>
              <Image
                source={require('../../assets/rasan-logo-gold.png')}
                resizeMode="contain"
                style={[styles.brandLogo, compact && styles.brandLogoCompact]}
                accessible
                accessibilityLabel="RASAN"
              />
              <Text style={styles.tagline}>WHERE HERITAGE MEETS EXCELLENCE</Text>
              <View style={styles.taglineRuleRow}>
                <View style={styles.taglineRule} />
                <View style={styles.taglineDiamond} />
                <View style={styles.taglineRule} />
              </View>
            </View>

            <Text variant="display" style={[styles.supportingText, compact && styles.supportingTextCompact, locale === 'ar' && styles.rtlText]}>
              {t('welcomeSupportingText')}
            </Text>

            <View style={styles.indicators} accessibilityLabel={t('welcomeSlideIndicator')}>
              <View style={styles.indicatorActive} />
              <View style={styles.indicator} />
              <View style={styles.indicator} />
            </View>

            <Pressable
              onPress={() => { void enterMarketplace(); }}
              disabled={entering}
              accessibilityRole="button"
              accessibilityLabel={t('enterRasan')}
              style={styles.primaryButtonOuter}
            >
              <LinearGradient
                colors={['#E9D19D', '#D9B675', '#C7A363']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text variant="display" style={styles.primaryButtonText}>
                  {entering ? t('loading') : t('enterRasan')}
                </Text>
                <Text style={styles.primaryButtonArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={[styles.separatorRow, locale === 'ar' && styles.rowReverse]}>
              <View style={styles.separatorLine} />
              <View style={styles.separatorDiamond} />
              <View style={styles.separatorLine} />
            </View>

            <View style={[styles.authButtons, locale === 'ar' && styles.rowReverse]}>
              <Pressable
                onPress={() => showAuthUnavailable('signIn')}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonIcon}>♙</Text>
                <Text style={styles.secondaryButtonText}>{t('signIn')}</Text>
              </Pressable>
              <Pressable
                onPress={() => showAuthUnavailable('joinRasan')}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonIcon}>＋</Text>
                <Text style={styles.secondaryButtonText}>{t('joinRasan')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.deep },
  backgroundImage: { resizeMode: 'cover' },
  safeArea: { flex: 1 },
  languageRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.page, paddingTop: 4 },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 41, 28, 0.76)',
    overflow: 'hidden',
  },
  languageOption: { minWidth: 43, minHeight: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  languageOptionSelected: { backgroundColor: 'rgba(217, 182, 117, 0.2)' },
  languageText: { color: palette.ivory, fontSize: 10 },
  languageTextSelected: { color: palette.gold, fontWeight: '700' },
  languageDivider: { width: StyleSheet.hairlineWidth, height: 18, backgroundColor: palette.border },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.page + 3,
    paddingTop: 0,
    paddingBottom: 8,
  },
  compactContent: { paddingBottom: 2 },
  brandBlock: { alignItems: 'center', marginBottom: 11 },
  brandLogo: { width: 260, height: 110, maxWidth: '88%' },
  brandLogoCompact: { width: 218, height: 88 },
  taglineRuleRow: { width: 190, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 10 },
  taglineRule: { flex: 1, height: 1, backgroundColor: palette.border },
  taglineDiamond: { width: 6, height: 6, backgroundColor: palette.gold, transform: [{ rotate: '45deg' }] },
  tagline: { color: palette.gold, fontSize: 8, fontWeight: '600', letterSpacing: 1.7, textAlign: 'center', marginTop: 2 },
  lowerContent: { alignItems: 'center', paddingBottom: 3 },
  supportingText: { color: palette.ivory, fontSize: 22, lineHeight: 30, textAlign: 'center', maxWidth: 340, textShadowColor: 'rgba(0,0,0,0.65)', textShadowRadius: 7 },
  supportingTextCompact: { fontSize: 19, lineHeight: 26 },
  indicators: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 16, marginBottom: 15 },
  indicatorActive: { width: 12, height: 7, borderRadius: 4, backgroundColor: palette.gold },
  indicator: { width: 8, height: 7, borderRadius: 4, backgroundColor: 'rgba(246, 232, 207, 0.48)' },
  primaryButtonOuter: { width: '100%', borderRadius: 29, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  primaryButton: { minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13, paddingHorizontal: 20 },
  primaryButtonText: { color: palette.deep, fontSize: 24, lineHeight: 29 },
  primaryButtonArrow: { color: palette.deep, fontSize: 17 },
  separatorRow: { width: '90%', flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13, marginBottom: 12 },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.border },
  separatorDiamond: { width: 5, height: 5, borderWidth: 1, borderColor: palette.gold, transform: [{ rotate: '45deg' }] },
  authButtons: { width: '100%', flexDirection: 'row', gap: 11 },
  secondaryButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: palette.border, borderRadius: 25, backgroundColor: 'rgba(6, 41, 28, 0.52)', paddingHorizontal: 7 },
  secondaryButtonIcon: { color: palette.gold, fontSize: 16 },
  secondaryButtonText: { color: palette.ivory, fontSize: 11, fontWeight: '600' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
