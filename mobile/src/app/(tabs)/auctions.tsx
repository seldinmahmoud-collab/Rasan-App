import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HorseImage, PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { useAppSettings } from '../../context/AppSettings';
import { sampleAuctions } from '../../data/sampleData';
import { homeColors as palette, spacing } from '../../theme';

type AuctionTab = 'live' | 'upcoming' | 'history';

const auctionTabs: { key: AuctionTab; icon: string }[] = [
  { key: 'live', icon: '◇' },
  { key: 'upcoming', icon: '▦' },
  { key: 'history', icon: '◷' },
];

export default function AuctionsScreen() {
  const { t, locale } = useAppSettings();
  const [activeTab, setActiveTab] = useState<AuctionTab>('upcoming');
  const hero = sampleAuctions[0];
  const visibleAuctions = activeTab === 'upcoming' ? sampleAuctions : [];

  return (
    <View style={styles.screen}>
      <PageHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <HorseImage
            uri={hero.image}
            accessibilityLabel={t('illustrativePhotography')}
            style={styles.heroImage}
          >
            <LinearGradient
              colors={['rgba(5, 20, 14, 0.02)', 'rgba(5, 20, 14, 0.48)', 'rgba(5, 20, 14, 0.9)']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <Text style={styles.eyebrow}>RASAN  /  {t('auctionShowcases')}</Text>
              <Text variant="display" style={[styles.heroTitle, locale === 'ar' && styles.rtlText]}>
                {t('auctionHeroTitle')}
              </Text>
              <Text style={[styles.heroSubtitle, locale === 'ar' && styles.rtlText]}>
                {t('auctionHeroSubtitle')}
              </Text>
              <Text style={styles.illustrativePhoto}>{t('illustrativePhotography')}</Text>
            </View>
          </HorseImage>
        </View>

        <View style={styles.tabFrame}>
          {auctionTabs.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={[styles.auctionTab, selected && styles.auctionTabSelected]}
              >
                {selected ? (
                  <LinearGradient
                    colors={['#E6C98D', palette.gold, '#C7A363']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.selectedTabGradient}
                  >
                    <Text style={styles.auctionTabIconSelected}>{tab.icon}</Text>
                    <Text style={styles.auctionTabTextSelected}>{t(`auctionTab${tab.key[0].toUpperCase()}${tab.key.slice(1)}` as Parameters<typeof t>[0])}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.auctionTabIcon}>{tab.icon}</Text>
                    <Text style={styles.auctionTabText}>
                      {t(`auctionTab${tab.key[0].toUpperCase()}${tab.key.slice(1)}` as Parameters<typeof t>[0])}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'upcoming' ? (
          <>
            <View style={[styles.sectionHeading, locale === 'ar' && styles.rowReverse]}>
              <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
                {t('upcoming')}
              </Text>
              <Text style={styles.sampleCount}>{sampleAuctions.length} {t('sampleData').toLowerCase()}</Text>
            </View>
            {visibleAuctions.map((auction) => (
              <Pressable
                key={auction.id}
                onPress={() => Alert.alert(t('demoTitle'), t('detailsSoon'))}
                accessibilityRole="button"
                accessibilityLabel={`${auction.title}, ${t('sampleData')}`}
                style={styles.auctionCard}
              >
                <View style={styles.auctionImageWrap}>
                  <HorseImage
                    uri={auction.image}
                    accessibilityLabel={t('illustrativePhotography')}
                    style={styles.auctionImage}
                  >
                    <LinearGradient
                      colors={['rgba(5, 20, 14, 0.04)', 'rgba(5, 20, 14, 0.58)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.cardImageBadge}>
                      <Text style={styles.badgeText}>{t('sampleData').toUpperCase()}</Text>
                    </View>
                  </HorseImage>
                </View>
                <View style={styles.auctionBody}>
                  <View style={[styles.statusRow, locale === 'ar' && styles.rowReverse]}>
                    <View style={styles.statusPill}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>{t('upcomingStatus').toUpperCase()}</Text>
                    </View>
                    <Text style={styles.entryCount}>{auction.entries}</Text>
                  </View>
                  <Text variant="display" style={[styles.auctionTitle, locale === 'ar' && styles.rtlText]}>
                    {auction.title}
                  </Text>
                  <View style={[styles.auctionMetaRow, locale === 'ar' && styles.rowReverse]}>
                    <Text style={styles.metaIcon}>⌖</Text>
                    <Text style={[styles.auctionMeta, locale === 'ar' && styles.rtlText]}>
                      {auction.location}
                    </Text>
                  </View>
                  <View style={[styles.auctionMetaRow, locale === 'ar' && styles.rowReverse]}>
                    <Text style={styles.metaIcon}>▦</Text>
                    <Text style={[styles.auctionMeta, locale === 'ar' && styles.rtlText]}>
                      {auction.date}
                    </Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <Text style={[styles.sampleDisclosure, locale === 'ar' && styles.rtlText]}>
                    {t('sampleAuctionDisclosure')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{activeTab === 'live' ? '◇' : '◷'}</Text>
            <Text variant="display" style={[styles.emptyTitle, locale === 'ar' && styles.rtlText]}>
              {activeTab === 'live' ? t('noLiveAuctions') : t('noAuctionHistory')}
            </Text>
            <Text style={[styles.emptyCopy, locale === 'ar' && styles.rtlText]}>
              {activeTab === 'live' ? t('noLiveAuctionsNote') : t('noAuctionHistoryNote')}
            </Text>
          </View>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>i</Text>
          <Text style={[styles.noticeText, locale === 'ar' && styles.rtlText]}>
            {t('auctionNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingBottom: 28 },
  hero: { height: 282, marginHorizontal: spacing.page, marginTop: 13, borderRadius: 13, overflow: 'hidden' },
  heroImage: { flex: 1, backgroundColor: palette.deep },
  heroContent: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: 18 },
  eyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  heroTitle: { color: palette.ivory, fontSize: 33, lineHeight: 38, maxWidth: 300, marginTop: 7 },
  heroSubtitle: { color: '#EFE5D1', fontSize: 11, lineHeight: 17, marginTop: 4, maxWidth: 290 },
  illustrativePhoto: { color: palette.gold, fontSize: 8, marginTop: 8 },
  tabFrame: {
    flexDirection: 'row',
    marginHorizontal: spacing.page,
    marginTop: 14,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 26,
    overflow: 'hidden',
  },
  auctionTab: {
    flex: 1,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: palette.panel,
  },
  auctionTabSelected: { backgroundColor: palette.gold },
  selectedTabGradient: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  auctionTabIcon: { color: palette.gold, fontSize: 13 },
  auctionTabIconSelected: { color: palette.deep, fontSize: 13 },
  auctionTabText: { color: palette.ivory, fontSize: 9, fontWeight: '600' },
  auctionTabTextSelected: { color: palette.deep, fontSize: 9, fontWeight: '700' },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginHorizontal: spacing.page,
    marginBottom: 12,
  },
  sectionTitle: { color: palette.ivory, fontSize: 25, lineHeight: 30 },
  sampleCount: { color: palette.gold, fontSize: 9 },
  auctionCard: {
    marginHorizontal: spacing.page,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    backgroundColor: palette.panel,
    overflow: 'hidden',
  },
  auctionImageWrap: { height: 174 },
  auctionImage: { flex: 1, backgroundColor: palette.deep },
  cardImageBadge: {
    position: 'absolute',
    top: 11,
    left: 11,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 15,
    backgroundColor: 'rgba(6, 41, 28, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  auctionBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 13 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.gold },
  statusText: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  entryCount: { color: palette.muted, fontSize: 9 },
  auctionTitle: { color: palette.ivory, fontSize: 22, lineHeight: 27, marginTop: 9 },
  auctionMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  metaIcon: { color: palette.gold, fontSize: 13 },
  auctionMeta: { color: palette.muted, fontSize: 10 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border, marginTop: 11 },
  sampleDisclosure: { color: palette.muted, fontSize: 8, lineHeight: 13, marginTop: 8 },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    paddingHorizontal: 22,
    paddingVertical: 29,
  },
  emptyIcon: { color: palette.gold, fontSize: 24 },
  emptyTitle: { color: palette.ivory, fontSize: 22, textAlign: 'center', marginTop: 9 },
  emptyCopy: { color: palette.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 7 },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    marginTop: 15,
    padding: 12,
  },
  noticeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.gold,
    color: palette.deep,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  noticeText: { flex: 1, color: palette.ivory, fontSize: 9, lineHeight: 15 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
