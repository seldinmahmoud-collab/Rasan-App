import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { Country, useAppSettings } from '../../context/AppSettings';
import { homeColors as palette, spacing } from '../../theme';

type AccountItemKey = 'savedHorses' | 'enquiries' | 'sellerAccess';

const accountItems: { key: AccountItemKey; icon: string; status: 'notConnected' | 'comingSoon' }[] = [
  { key: 'savedHorses', icon: '♡', status: 'notConnected' },
  { key: 'enquiries', icon: '✉', status: 'notConnected' },
  { key: 'sellerAccess', icon: '♙', status: 'comingSoon' },
];

export default function AccountScreen() {
  const { t, locale, setLocale, country, countries, setCountry } = useAppSettings();
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <PageHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHero}>
          <LinearGradient
            colors={['#0B3528', '#06291C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.eyebrow}>RASAN  /  {t('community')}</Text>
          <View style={[styles.profileRow, locale === 'ar' && styles.rowReverse]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>♙</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="display" style={[styles.profileTitle, locale === 'ar' && styles.rtlText]}>
                {t('guestProfile')}
              </Text>
              <Text style={[styles.profileSubtitle, locale === 'ar' && styles.rtlText]}>
                {t('profileNotConnected')}
              </Text>
            </View>
            <View style={styles.profileArrow}>
              <Text style={styles.profileArrowText}>{locale === 'ar' ? '↙' : '↗'}</Text>
            </View>
          </View>
          <View style={[styles.profileFooter, locale === 'ar' && styles.rowReverse]}>
            <Text style={styles.profileFooterIcon}>◇</Text>
            <Text style={[styles.profileFooterText, locale === 'ar' && styles.rtlText]}>
              {t('accountDemoNotice')}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
            {t('membership')}
          </Text>
          <View style={styles.headingRule} />
        </View>
        <View style={styles.membershipCard}>
          <View style={styles.membershipSeal}>
            <Text style={styles.membershipSealIcon}>♕</Text>
          </View>
          <View style={styles.membershipInfo}>
            <Text variant="display" style={[styles.membershipTitle, locale === 'ar' && styles.rtlText]}>
              {t('membershipUnavailable')}
            </Text>
            <Text style={[styles.membershipNote, locale === 'ar' && styles.rtlText]}>
              {t('membershipNotConnected')}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{t('notConnected').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
            {t('accountServices')}
          </Text>
          <View style={styles.headingRule} />
        </View>
        <View style={styles.accountList}>
          {accountItems.map((item) => {
            const status = item.status === 'comingSoon' ? t('comingSoon') : t('notConnected');
            return (
              <View
                key={item.key}
                style={[styles.accountRow, locale === 'ar' && styles.rowReverse]}
              >
                <View style={styles.accountIconFrame}>
                  <Text style={styles.accountIcon}>{item.icon}</Text>
                </View>
                <View style={styles.accountItemInfo}>
                  <Text style={[styles.accountItemTitle, locale === 'ar' && styles.rtlText]}>
                    {t(item.key)}
                  </Text>
                  <Text style={[styles.accountItemNote, locale === 'ar' && styles.rtlText]}>
                    {t(item.status === 'comingSoon' ? 'sellerAccessNote' : 'accountFeatureNote')}
                  </Text>
                </View>
                <Text style={styles.accountStatus}>{status}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeading}>
          <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
            {t('settings')}
          </Text>
          <View style={styles.headingRule} />
        </View>
        <View style={styles.settingsCard}>
          <View style={[styles.settingRow, locale === 'ar' && styles.rowReverse]}>
            <View style={styles.settingIconFrame}>
              <Text style={styles.settingIcon}>文</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, locale === 'ar' && styles.rtlText]}>
                {t('languageTitle')}
              </Text>
              <Text style={[styles.settingValue, locale === 'ar' && styles.rtlText]}>
                {locale === 'en' ? 'English' : 'العربية'}
              </Text>
            </View>
            <Pressable
              onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              style={styles.settingAction}
              accessibilityRole="button"
              accessibilityLabel={t('language')}
            >
              <Text style={styles.settingActionText}>{t('language')}</Text>
            </Pressable>
          </View>
          <View style={styles.settingDivider} />
          <View style={[styles.settingRow, locale === 'ar' && styles.rowReverse]}>
            <View style={styles.settingIconFrame}>
              <Text style={styles.settingIcon}>⌖</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, locale === 'ar' && styles.rtlText]}>
                {t('countryTitle')}
              </Text>
              <Text style={[styles.settingValue, locale === 'ar' && styles.rtlText]}>
                {country.name}
              </Text>
            </View>
            <Pressable
              onPress={() => setCountryOpen(true)}
              style={styles.settingAction}
              accessibilityRole="button"
              accessibilityLabel={t('selectCountry')}
            >
              <Text style={styles.settingActionText}>{t('changeMarket')}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/welcome')}
          style={[styles.welcomePreviewButton, locale === 'ar' && styles.rowReverse]}
          accessibilityRole="button"
          accessibilityLabel={t('welcomePreview')}
        >
          <Text style={styles.welcomePreviewIcon}>✦</Text>
          <Text style={[styles.welcomePreviewText, locale === 'ar' && styles.rtlText]}>
            {t('welcomePreview')}
          </Text>
          <Text style={styles.welcomePreviewArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
        </Pressable>

        <Text style={[styles.footerNote, locale === 'ar' && styles.rtlText]}>
          {t('accountServicesNotConnected')}
        </Text>
      </ScrollView>

      <Modal
        visible={countryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryOpen(false)}
      >
        <View style={styles.modalScrim}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCountryOpen(false)}
            accessibilityLabel={t('back')}
          />
          <View style={styles.countrySheet}>
            <Text style={styles.sheetEyebrow}>{t('countryTitle').toUpperCase()}</Text>
            <Text variant="display" style={styles.sheetTitle}>{t('selectCountry')}</Text>
            {countries.map((option: Country) => (
              <Pressable
                key={option.flag}
                style={[styles.countryOption, country.flag === option.flag && styles.countryOptionSelected]}
                onPress={() => {
                  setCountry(option);
                  setCountryOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: country.flag === option.flag }}
              >
                <Text style={styles.countryCode}>{option.flag}</Text>
                <Text style={styles.countryName}>{option.name}</Text>
                {country.flag === option.flag ? <Text style={styles.countryCheck}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingHorizontal: spacing.page, paddingTop: 16, paddingBottom: 30 },
  profileHero: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 17,
  },
  eyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 17 },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 27,
    backgroundColor: 'rgba(217, 182, 117, 0.08)',
  },
  avatarIcon: { color: palette.gold, fontSize: 23 },
  profileInfo: { flex: 1 },
  profileTitle: { color: palette.ivory, fontSize: 23, lineHeight: 28 },
  profileSubtitle: { color: palette.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  profileArrow: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 15,
  },
  profileArrowText: { color: palette.gold, fontSize: 13 },
  profileFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    marginTop: 15,
    paddingTop: 11,
  },
  profileFooterIcon: { color: palette.gold, fontSize: 13 },
  profileFooterText: { flex: 1, color: palette.ivory, fontSize: 9, lineHeight: 15 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 23, marginBottom: 11 },
  sectionTitle: { color: palette.ivory, fontSize: 23, lineHeight: 28 },
  headingRule: { flex: 1, height: 1, backgroundColor: palette.border },
  membershipCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
    padding: 12,
  },
  membershipSeal: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
  },
  membershipSealIcon: { color: palette.gold, fontSize: 20 },
  membershipInfo: { flex: 1 },
  membershipTitle: { color: palette.ivory, fontSize: 17, lineHeight: 21 },
  membershipNote: { color: palette.muted, fontSize: 8, lineHeight: 13, marginTop: 3 },
  statusBadge: { borderWidth: 1, borderColor: palette.border, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 5 },
  statusBadgeText: { color: palette.gold, fontSize: 7, fontWeight: '700', letterSpacing: 0.4 },
  accountList: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
    paddingHorizontal: 12,
  },
  accountRow: { minHeight: 73, flexDirection: 'row', alignItems: 'center', gap: 9 },
  accountIconFrame: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
  },
  accountIcon: { color: palette.gold, fontSize: 16 },
  accountItemInfo: { flex: 1 },
  accountItemTitle: { color: palette.ivory, fontSize: 11, fontWeight: '600' },
  accountItemNote: { color: palette.muted, fontSize: 8, lineHeight: 12, marginTop: 3 },
  accountStatus: { color: palette.gold, fontSize: 7, fontWeight: '600', textAlign: 'right' },
  settingsCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
    paddingHorizontal: 12,
  },
  settingRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 9 },
  settingIconFrame: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
  },
  settingIcon: { color: palette.gold, fontSize: 14 },
  settingInfo: { flex: 1 },
  settingLabel: { color: palette.muted, fontSize: 8 },
  settingValue: { color: palette.ivory, fontSize: 10, marginTop: 4 },
  settingAction: {
    minHeight: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    paddingHorizontal: 9,
  },
  settingActionText: { color: palette.gold, fontSize: 8, fontWeight: '600' },
  settingDivider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border },
  welcomePreviewButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
  },
  welcomePreviewIcon: { color: palette.gold, fontSize: 15 },
  welcomePreviewText: { flex: 1, color: palette.ivory, fontSize: 10, fontWeight: '600' },
  welcomePreviewArrow: { color: palette.gold, fontSize: 13 },
  footerNote: { color: palette.muted, fontSize: 8, lineHeight: 14, marginTop: 16 },
  modalScrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  countrySheet: {
    backgroundColor: palette.deep,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: palette.gold,
  },
  sheetEyebrow: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  sheetTitle: { color: palette.ivory, fontSize: 27, marginTop: 5, marginBottom: 12 },
  countryOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    paddingHorizontal: 5,
  },
  countryOptionSelected: { backgroundColor: palette.panel },
  countryCode: { color: palette.gold, fontSize: 11, fontWeight: '700', minWidth: 25 },
  countryName: { flex: 1, color: palette.ivory, fontSize: 12 },
  countryCheck: { color: palette.gold, fontSize: 16 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
