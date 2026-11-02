import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HorseImage } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { Country, useAppSettings } from '../../context/AppSettings';
import { illustrativeHorsePhotos } from '../../data/illustrativeImages';
import { sampleAuctions, sampleMemberships } from '../../data/sampleData';
import type { Horse } from '../../data/types';
import { useHorseListings } from '../../hooks/useHorseData';
import { homeColors, spacing } from '../../theme';

const shortcuts = [
  { key: 'home', route: '/' as const, icon: '⌂' },
  { key: 'horses', route: '/horses' as const, icon: '♞' },
  { key: 'auctions', route: '/auctions' as const, icon: '♢' },
  { key: 'shop', route: '/shop' as const, icon: '◇' },
  { key: 'account', route: '/account' as const, icon: '♙' },
] as const;

const serviceLinks = shortcuts.slice(1);

function HomeHeader() {
  const { country, countries, locale, setCountry, setLocale, t } = useAppSettings();
  const [countryOpen, setCountryOpen] = useState(false);
  const rtl = locale === 'ar';

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={[styles.header, rtl && styles.rowReverse]}>
          <Image
            source={require('../../../assets/rasan-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
            accessible
            accessibilityLabel="RASAN"
          />
          <View style={[styles.headerActions, rtl && styles.rowReverse]}>
            <Pressable
              style={styles.marketButton}
              onPress={() => setCountryOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${t('country')}: ${country.name}`}
              hitSlop={6}
            >
              <Text style={styles.marketCode}>{country.flag}</Text>
              <Text style={styles.marketChevron}>⌄</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/horses')}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel={t('homeBrowsePrompt')}
              hitSlop={6}
            >
              <Text style={styles.headerIcon}>⌕</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/account')}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel={t('account')}
              hitSlop={6}
            >
              <Text style={styles.headerIcon}>♙</Text>
            </Pressable>
            <Pressable
              onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              style={styles.languageButton}
              accessibilityRole="button"
              accessibilityLabel={t('language')}
              hitSlop={6}
            >
              <Text style={styles.languageText}>{t('language')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
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
    </>
  );
}

function HomeSectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { locale } = useAppSettings();
  return (
    <View style={[styles.sectionHeading, locale === 'ar' && styles.rowReverse]}>
      <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action} ↗</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DemoLabel({ children }: { children: string }) {
  return (
    <View style={styles.demoLabel}>
      <Text style={styles.demoLabelText}>{children}</Text>
    </View>
  );
}

function FeaturedHorseCard({ horse, width }: { horse: Horse; width: number }) {
  const { t, locale } = useAppSettings();
  const photo = horse.photos[0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${horse.name}, ${t('sample')}`}
      onPress={() => router.push(`/horses/${horse.id}`)}
      style={[styles.featureCard, { width }]}
    >
      <HorseImage
        uri={photo?.url}
        accessibilityLabel={photo?.altText}
        style={styles.featureImage}
      >
        <LinearGradient
          colors={['rgba(5, 20, 14, 0.02)', 'rgba(5, 20, 14, 0.18)', 'rgba(5, 20, 14, 0.88)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.featureImageOverlay}>
          <DemoLabel>{t('sample')}</DemoLabel>
          <View>
            <Text style={[styles.featureCategory, locale === 'ar' && styles.rtlText]}>
              {horse.category.toUpperCase()}
            </Text>
            <Text variant="display" style={[styles.featureName, locale === 'ar' && styles.rtlText]}>
              {horse.name}
            </Text>
            <Text style={[styles.featureSubline, locale === 'ar' && styles.rtlText]}>
              {horse.breed} · {horse.age}
            </Text>
            <View style={[styles.featureFooter, locale === 'ar' && styles.rowReverse]}>
              <Text style={styles.featurePrice}>{horse.price}</Text>
              <Text style={styles.featureLocation}>{horse.location}</Text>
            </View>
          </View>
        </View>
      </HorseImage>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { t, locale, country } = useAppSettings();
  const { horses, loading, error } = useHorseListings(country.flag);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const featured = horses[0];
  const heroPhoto = featured?.photos[0]?.url ?? illustrativeHorsePhotos.desert;
  const featureCardWidth = Math.min(220, Math.max(156, (windowWidth - spacing.page * 2 - 20) / 2.05));
  const heroHeight = Math.min(460, Math.max(340, windowHeight * 0.47));

  return (
    <View style={styles.screen}>
      <HomeHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          onPress={() => router.push('/horses')}
          style={[styles.searchBar, locale === 'ar' && styles.rowReverse]}
          accessibilityRole="button"
          accessibilityLabel={t('homeBrowsePrompt')}
        >
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={[styles.searchText, locale === 'ar' && styles.rtlText]}>
            {t('homeBrowsePrompt')}
          </Text>
          <Text style={styles.searchArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
        </Pressable>

        <View style={[styles.hero, { height: heroHeight }]}>
          <HorseImage
            uri={heroPhoto}
            accessibilityLabel={featured?.photos[0]?.altText ?? t('illustrativePhotography')}
            style={styles.heroImage}
          >
            <LinearGradient
              colors={['rgba(4, 17, 12, 0.04)', 'rgba(4, 17, 12, 0.25)', 'rgba(4, 17, 12, 0.88)']}
              locations={[0, 0.44, 1]}
              style={StyleSheet.absoluteFill}
            />
          </HorseImage>
          <View style={styles.heroContent}>
            <View style={[styles.heroEyebrowRow, locale === 'ar' && styles.rowReverse]}>
              <View style={styles.heroRule} />
              <Text style={styles.heroEyebrow}>RASAN  /  {country.flag}</Text>
              <Text style={styles.heroPhotoNote}>{t('illustrativePhotography')}</Text>
            </View>
            <Text variant="display" style={[styles.heroTitle, locale === 'ar' && styles.rtlText]}>
              {t('title')}
            </Text>
            <Text style={[styles.heroSubtitle, locale === 'ar' && styles.rtlText]}>
              {t('subtitle')}
            </Text>
            <Pressable
              onPress={() => router.push('/horses')}
              accessibilityRole="button"
              accessibilityLabel={t('explore')}
              style={styles.heroButtonOuter}
            >
              <LinearGradient
                colors={['#E6C98D', homeColors.gold, '#C7A363']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.heroButton, locale === 'ar' && styles.rowReverse]}
              >
                <Text style={styles.heroButtonText}>{t('explore')}</Text>
                <Text style={styles.heroButtonArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <View style={[styles.shortcutGrid, locale === 'ar' && styles.rowReverse]}>
          {shortcuts.map((shortcut) => (
            <Pressable
              key={shortcut.key}
              onPress={() => router.push(shortcut.route)}
              accessibilityRole="button"
              accessibilityLabel={t(shortcut.key)}
              style={styles.shortcut}
            >
              <View style={styles.shortcutIconFrame}>
                <Text style={styles.shortcutIcon}>{shortcut.icon}</Text>
              </View>
              <Text style={[styles.shortcutLabel, locale === 'ar' && styles.rtlText]}>
                {t(shortcut.key)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.disclosureRow, locale === 'ar' && styles.rowReverse]}>
          <View style={styles.noticeRule} />
          <Text style={[styles.noticeText, locale === 'ar' && styles.rtlText]}>
            {t('horseDemoNotice')}
          </Text>
        </View>

        <HomeSectionHeading
          title={t('homeFeaturedHorses')}
          action={t('viewAll')}
          onAction={() => router.push('/horses')}
        />
        {loading ? (
          <View style={styles.contentNotice}>
            <ActivityIndicator color={homeColors.gold} />
            <Text style={styles.contentNoticeText}>{t('loading')}</Text>
          </View>
        ) : null}
        {error ? (
          <Text style={styles.errorText}>{`${t('loadError')} ${error.message}`}</Text>
        ) : null}
        {!loading && !error && horses.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCards}
          >
            {horses.slice(0, 4).map((horse) => (
              <FeaturedHorseCard key={horse.id} horse={horse} width={featureCardWidth} />
            ))}
          </ScrollView>
        ) : null}
        {!loading && !error && horses.length === 0 ? (
          <Text style={styles.emptyText}>{t('noHorsesInMarket')}</Text>
        ) : null}

        <HomeSectionHeading
          title={t('homeAuctionShowcase')}
          action={t('viewAll')}
          onAction={() => router.push('/auctions')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCards}
        >
          {sampleAuctions.map((auction) => (
            <Pressable
              key={auction.id}
              onPress={() => router.push('/auctions')}
              accessibilityRole="button"
              accessibilityLabel={`${auction.title}, ${t('sampleData')}`}
              style={[styles.auctionCard, { width: featureCardWidth }]}
            >
              <HorseImage uri={auction.image} style={styles.auctionImage}>
                <LinearGradient
                  colors={['rgba(5, 20, 14, 0.06)', 'rgba(5, 20, 14, 0.7)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.auctionImageLabel}>
                  <DemoLabel>{`${t('sampleData')} · ${t('upcomingStatus')}`}</DemoLabel>
                </View>
              </HorseImage>
              <View style={styles.auctionBody}>
                <Text variant="display" style={[styles.auctionTitle, locale === 'ar' && styles.rtlText]}>
                  {auction.title}
                </Text>
                <Text style={[styles.auctionMeta, locale === 'ar' && styles.rtlText]}>
                  {auction.date} · {auction.location}
                </Text>
                <Text style={[styles.auctionMeta, locale === 'ar' && styles.rtlText]}>
                  {`${Number.parseInt(auction.entries, 10)} ${t('sampleListings')}`}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <HomeSectionHeading title={t('homeServices')} />
        <View style={[styles.serviceGrid, locale === 'ar' && styles.rowReverse]}>
          {serviceLinks.map((shortcut) => (
            <Pressable
              key={`service-${shortcut.key}`}
              onPress={() => router.push(shortcut.route)}
              accessibilityRole="button"
              accessibilityLabel={t(shortcut.key)}
              style={[styles.serviceCard, locale === 'ar' && styles.rowReverse]}
            >
              <View style={styles.serviceIconFrame}>
                <Text style={styles.serviceIcon}>{shortcut.icon}</Text>
              </View>
              <Text style={[styles.serviceLabel, locale === 'ar' && styles.rtlText]}>
                {t(shortcut.key)}
              </Text>
              <Text style={styles.serviceArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
            </Pressable>
          ))}
        </View>

        <HomeSectionHeading title={t('homeMembershipBenefits')} />
        <View style={styles.membershipCard}>
          <View style={[styles.membershipTop, locale === 'ar' && styles.rowReverse]}>
            <Text style={styles.membershipEyebrow}>{t('homeMembership').toUpperCase()}</Text>
            <DemoLabel>{t('sampleData')}</DemoLabel>
          </View>
          <Text variant="display" style={[styles.membershipName, locale === 'ar' && styles.rtlText]}>
            {sampleMemberships[0].name}
          </Text>
          <Text style={[styles.membershipCopy, locale === 'ar' && styles.rtlText]}>
            {t('homeMembershipBody')}
          </Text>
          <Text style={[styles.membershipDisclosure, locale === 'ar' && styles.rtlText]}>
            {t('demoBody')}
          </Text>
          <Pressable
            onPress={() => router.push('/account')}
            accessibilityRole="button"
            style={[styles.membershipLink, locale === 'ar' && styles.rowReverse]}
          >
            <Text style={styles.membershipLinkText}>{t('memberProfile')}</Text>
            <Text style={styles.membershipLinkArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeColors.background },
  headerSafeArea: { backgroundColor: homeColors.background },
  header: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeColors.border,
  },
  brandLogo: { width: 112, height: 50 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  marketButton: {
    minWidth: 49,
    height: 36,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  marketCode: { color: homeColors.ivory, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  marketChevron: { color: homeColors.gold, fontSize: 14, marginTop: -4 },
  headerIconButton: { width: 30, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: homeColors.gold, fontSize: 23, lineHeight: 28 },
  languageButton: {
    minWidth: 44,
    height: 36,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  languageText: { color: homeColors.gold, fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: spacing.page, paddingBottom: 32 },
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 12,
    backgroundColor: homeColors.panel,
    marginTop: 13,
    marginBottom: 13,
    paddingHorizontal: 15,
  },
  searchIcon: { color: homeColors.gold, fontSize: 25, lineHeight: 29 },
  searchText: { flex: 1, color: homeColors.ivory, fontSize: 12 },
  searchArrow: { color: homeColors.gold, fontSize: 16 },
  hero: {
    position: 'relative',
    backgroundColor: homeColors.deep,
    marginHorizontal: -spacing.page,
    overflow: 'hidden',
  },
  heroImage: { ...StyleSheet.absoluteFill },
  heroContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.page + 3,
    paddingBottom: 25,
  },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  heroRule: { width: 22, height: 1, backgroundColor: homeColors.gold },
  heroEyebrow: { color: homeColors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  heroPhotoNote: { color: homeColors.ivory, fontSize: 8, opacity: 0.84 },
  heroTitle: { color: homeColors.ivory, fontSize: 38, lineHeight: 43, maxWidth: 330 },
  heroSubtitle: { color: '#F6EEDC', fontSize: 12, lineHeight: 19, marginTop: 6, maxWidth: 310 },
  heroButtonOuter: { alignSelf: 'flex-start', borderRadius: 22, marginTop: 16, overflow: 'hidden' },
  heroButton: {
    minWidth: 162,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
  },
  heroButtonText: { color: homeColors.deep, fontSize: 12, fontWeight: '700' },
  heroButtonArrow: { color: homeColors.deep, fontSize: 16 },
  shortcutGrid: { flexDirection: 'row', gap: 7, marginTop: 16, marginBottom: 18 },
  shortcut: {
    flex: 1,
    minWidth: 0,
    minHeight: 79,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: homeColors.panel,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 11,
    paddingHorizontal: 3,
    paddingVertical: 8,
  },
  shortcutIconFrame: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 16,
  },
  shortcutIcon: { color: homeColors.gold, fontSize: 17, lineHeight: 22 },
  shortcutLabel: { color: homeColors.ivory, fontSize: 8, fontWeight: '600', textAlign: 'center' },
  disclosureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 19, paddingHorizontal: 2 },
  noticeRule: { width: 17, height: 1, backgroundColor: homeColors.gold, marginTop: 7 },
  noticeText: { flex: 1, color: homeColors.muted, fontSize: 9, lineHeight: 15 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: { flex: 1, color: homeColors.ivory, fontSize: 25, lineHeight: 30 },
  sectionAction: { color: homeColors.gold, fontSize: 10, fontWeight: '600' },
  horizontalCards: { paddingBottom: 10, paddingRight: 4, gap: 11 },
  featureCard: {
    height: 244,
    backgroundColor: homeColors.deep,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureImage: { flex: 1, backgroundColor: homeColors.deep },
  featureImageOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 11,
  },
  demoLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(23, 27, 23, 0.78)',
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  demoLabelText: { color: homeColors.gold, fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  featureCategory: { color: homeColors.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  featureName: { color: homeColors.ivory, fontSize: 21, lineHeight: 25, marginTop: 2 },
  featureSubline: { color: '#F0E7D7', fontSize: 9, marginTop: 3 },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeColors.border,
    marginTop: 9,
    paddingTop: 7,
    gap: 4,
  },
  featurePrice: { color: homeColors.ivory, fontSize: 10, fontWeight: '700' },
  featureLocation: { color: '#E1D5BD', fontSize: 8, flexShrink: 1, textAlign: 'right' },
  contentNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 },
  contentNoticeText: { color: homeColors.ivory, fontSize: 12 },
  errorText: { color: '#F2B1A8', fontSize: 12, lineHeight: 18, paddingVertical: 16 },
  emptyText: { color: homeColors.muted, fontSize: 12, lineHeight: 18, paddingVertical: 16 },
  auctionCard: {
    backgroundColor: homeColors.panel,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  auctionImage: { height: 145, backgroundColor: homeColors.deep },
  auctionImageLabel: { position: 'absolute', top: 10, left: 10, right: 10, alignItems: 'flex-start' },
  auctionBody: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13 },
  auctionTitle: { color: homeColors.ivory, fontSize: 19, lineHeight: 23 },
  auctionMeta: { color: homeColors.muted, fontSize: 9, lineHeight: 15, marginTop: 5 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 21 },
  serviceCard: {
    width: '48%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: homeColors.panel,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  serviceIconFrame: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 18,
  },
  serviceIcon: { color: homeColors.gold, fontSize: 18 },
  serviceLabel: { flex: 1, color: homeColors.ivory, fontSize: 10, fontWeight: '600' },
  serviceArrow: { color: homeColors.gold, fontSize: 15 },
  membershipCard: {
    backgroundColor: homeColors.panel,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 14,
    padding: 17,
    marginBottom: 9,
  },
  membershipTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  membershipEyebrow: { color: homeColors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  membershipName: { color: homeColors.ivory, fontSize: 25, lineHeight: 30, marginTop: 15 },
  membershipCopy: { color: '#F0E7D7', fontSize: 11, lineHeight: 18, marginTop: 7 },
  membershipDisclosure: { color: homeColors.muted, fontSize: 9, lineHeight: 15, marginTop: 10 },
  membershipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: homeColors.border,
    marginTop: 14,
    paddingTop: 12,
  },
  membershipLinkText: { color: homeColors.gold, fontSize: 11, fontWeight: '700' },
  membershipLinkArrow: { color: homeColors.gold, fontSize: 16 },
  modalScrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.62)' },
  countrySheet: {
    backgroundColor: homeColors.deep,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: homeColors.gold,
  },
  sheetEyebrow: { color: homeColors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  sheetTitle: { color: homeColors.ivory, fontSize: 27, marginTop: 5, marginBottom: 12 },
  countryOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeColors.border,
    paddingHorizontal: 5,
  },
  countryOptionSelected: { backgroundColor: homeColors.panel },
  countryCode: { color: homeColors.gold, fontSize: 11, fontWeight: '700', minWidth: 25 },
  countryName: { flex: 1, color: homeColors.ivory, fontSize: 12 },
  countryCheck: { color: homeColors.gold, fontSize: 16 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
