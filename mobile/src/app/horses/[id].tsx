import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ImageGallery, PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { useAppSettings } from '../../context/AppSettings';
import { useHorseDetails } from '../../hooks/useHorseData';
import { homeColors as palette, spacing } from '../../theme';
import type { Horse } from '../../data/types';

function GoldRule() {
  return <View style={styles.goldRule} />;
}

function DetailFact({ label, value, locale }: { label: string; value: string; locale: string }) {
  return (
    <View style={[styles.factRow, locale === 'ar' && styles.rowReverse]}>
      <Text style={[styles.factLabel, locale === 'ar' && styles.rtlText]}>{label}</Text>
      <Text style={[styles.factValue, locale === 'ar' && styles.rtlText]}>{value}</Text>
    </View>
  );
}

function RecordCard({
  icon,
  title,
  status,
  description,
  locale,
}: {
  icon: string;
  title: string;
  status: string;
  description: string;
  locale: string;
}) {
  return (
    <View style={styles.recordCard}>
      <View style={[styles.recordHeading, locale === 'ar' && styles.rowReverse]}>
        <Text style={styles.recordIcon}>{icon}</Text>
        <Text variant="display" style={[styles.recordTitle, locale === 'ar' && styles.rtlText]}>
          {title}
        </Text>
      </View>
      <GoldRule />
      <Text style={[styles.recordStatus, locale === 'ar' && styles.rtlText]}>{status}</Text>
      <Text style={[styles.recordDescription, locale === 'ar' && styles.rtlText]}>{description}</Text>
    </View>
  );
}

function HorsePassport({ horse, locale, t }: {
  horse: Horse;
  locale: string;
  t: ReturnType<typeof useAppSettings>['t'];
}) {
  return (
    <View style={styles.passport}>
      <View style={[styles.passportHeader, locale === 'ar' && styles.rowReverse]}>
        <View style={styles.passportTitleGroup}>
          <Text style={styles.passportEyebrow}>RASAN  /  DIGITAL RECORD</Text>
          <Text variant="display" style={[styles.passportTitle, locale === 'ar' && styles.rtlText]}>
            {t('passport')}
          </Text>
        </View>
        <View style={styles.illustrativeBadge}>
          <Text style={styles.illustrativeBadgeText}>{t('illustrativeStatus')}</Text>
        </View>
      </View>

      <View style={styles.passportIdentity}>
        <View style={[styles.identityHeader, locale === 'ar' && styles.rowReverse]}>
          <Text style={styles.identityIcon}>♞</Text>
          <Text variant="display" style={[styles.identityTitle, locale === 'ar' && styles.rtlText]}>
            {t('horseIdentity')}
          </Text>
        </View>
        <GoldRule />
        <DetailFact label={t('digitalRecordId')} value={horse.passport.recordId} locale={locale} />
        <DetailFact label={t('horses')} value={horse.name} locale={locale} />
        <DetailFact label={t('breed')} value={horse.breed} locale={locale} />
        <DetailFact label={t('sex')} value={horse.sex} locale={locale} />
        <DetailFact label={t('age')} value={horse.age} locale={locale} />
        <DetailFact label={t('location')} value={horse.location} locale={locale} />
      </View>

      <View style={styles.recordsGrid}>
        <RecordCard
          icon="♧"
          title={t('pedigreeRecords')}
          status={t('recordNotConnected')}
          description={t('recordUnavailableDescription')}
          locale={locale}
        />
        <RecordCard
          icon="◷"
          title={t('ownershipHistory')}
          status={t('recordNotConnected')}
          description={t('recordUnavailableDescription')}
          locale={locale}
        />
        <RecordCard
          icon="⛨"
          title={t('verificationRecords')}
          status={t('notVerified')}
          description={t('recordUnavailableDescription')}
          locale={locale}
        />
        <RecordCard
          icon="＋"
          title={t('healthRecords')}
          status={t('recordNotConnected')}
          description={t('recordUnavailableDescription')}
          locale={locale}
        />
        <RecordCard
          icon="▤"
          title={t('documents')}
          status={t('recordNotConnected')}
          description={t('recordUnavailableDescription')}
          locale={locale}
        />
      </View>
      <Text style={[styles.passportNote, locale === 'ar' && styles.rtlText]}>
        {t('passportDemoNotice')}
      </Text>
    </View>
  );
}

export default function HorseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale, country } = useAppSettings();
  const { horse, loading, error } = useHorseDetails(id, country.flag);
  const { height: windowHeight } = useWindowDimensions();
  const galleryHeight = Math.min(470, Math.max(330, windowHeight * 0.44));

  return (
    <View style={styles.screen}>
      <PageHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.noticeText}>{t('loading')}</Text>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{`${t('loadError')} ${error.message}`}</Text> : null}
        {!loading && !error && !horse ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t('noHorsesInMarket')}</Text>
          </View>
        ) : null}
        {horse ? (
          <>
            <View style={[styles.galleryFrame, { height: galleryHeight }]}>
              <ImageGallery
                photos={horse.photos}
                style={[styles.gallery, { height: galleryHeight }]}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(5, 20, 14, 0.3)', 'transparent', 'rgba(5, 20, 14, 0.28)']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.galleryBadge}>
                <View style={styles.illustrativeBadge}>
                  <Text style={styles.illustrativeBadgeText}>{t('sample')}</Text>
                </View>
                <Text style={styles.photoDisclosure}>{t('illustrativePhotography')}</Text>
              </View>
            </View>

            <View style={styles.content}>
              <View style={[styles.summaryEyebrow, locale === 'ar' && styles.rowReverse]}>
                <Text style={styles.category}>{horse.category.toUpperCase()}</Text>
                <Text style={styles.summaryDot}>·</Text>
                <Text style={styles.summaryStatus}>{t('notVerified')}</Text>
              </View>
              <Text variant="display" style={[styles.name, locale === 'ar' && styles.rtlText]}>
                {horse.name}
              </Text>
              <Text style={[styles.subline, locale === 'ar' && styles.rtlText]}>
                {horse.breed}  ·  {horse.sex}  ·  {horse.age}
              </Text>

              <View style={[styles.priceLocation, locale === 'ar' && styles.rowReverse]}>
                <Text style={styles.price}>{horse.price}</Text>
                <View style={[styles.locationRow, locale === 'ar' && styles.rowReverse]}>
                  <Text style={styles.locationIcon}>⌖</Text>
                  <Text style={styles.location}>{horse.location}</Text>
                </View>
              </View>

              <View style={[styles.demoNotice, locale === 'ar' && styles.rowReverse]}>
                <Text style={styles.noticeMark}>i</Text>
                <Text style={[styles.demoNoticeText, locale === 'ar' && styles.rtlText]}>
                  {t('horseDemoNotice')}
                </Text>
              </View>

              <View style={styles.sectionHeading}>
                <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
                  {t('details')}
                </Text>
                <GoldRule />
              </View>
              <View style={styles.factsCard}>
                <DetailFact label={t('breed')} value={horse.breed} locale={locale} />
                <DetailFact label={t('age')} value={horse.age} locale={locale} />
                <DetailFact label={t('sex')} value={horse.sex} locale={locale} />
                <DetailFact label={t('location')} value={horse.location} locale={locale} />
                <DetailFact label={t('seller')} value={t('sellerNotConnected')} locale={locale} />
              </View>

              <View style={styles.sectionHeading}>
                <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
                  {t('passport')}
                </Text>
                <GoldRule />
              </View>
              <HorsePassport horse={horse} locale={locale} t={t} />

              <Pressable
                onPress={() => Alert.alert(t('enquiry'), t('enquiryNote'))}
                style={styles.enquiryButtonOuter}
                accessibilityRole="button"
                accessibilityLabel={t('enquiry')}
              >
                <LinearGradient
                  colors={['#E6C98D', palette.gold, '#C7A363']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.enquiryButton, locale === 'ar' && styles.rowReverse]}
                >
                  <Text style={styles.enquiryIcon}>✉</Text>
                  <Text style={styles.enquiryButtonText}>{t('enquiry')}</Text>
                  <Text style={styles.enquiryArrow}>{locale === 'ar' ? '↙' : '↗'}</Text>
                </LinearGradient>
              </Pressable>
              <Text style={[styles.enquiryNote, locale === 'ar' && styles.rtlText]}>
                {t('enquiryNote')}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingHorizontal: spacing.page, paddingBottom: 24 },
  content: { paddingHorizontal: spacing.page, paddingTop: 16 },
  galleryFrame: {
    position: 'relative',
    marginHorizontal: -spacing.page,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  gallery: { width: '100%', backgroundColor: palette.deep },
  galleryBadge: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page + 3,
    paddingTop: 14,
  },
  illustrativeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 41, 28, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  illustrativeBadgeText: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  photoDisclosure: { color: palette.ivory, fontSize: 8, marginTop: 5, textShadowColor: '#000', textShadowRadius: 4 },
  summaryEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  category: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  summaryDot: { color: palette.gold, fontSize: 12 },
  summaryStatus: { color: palette.muted, fontSize: 9 },
  name: { color: palette.ivory, fontSize: 35, lineHeight: 42, marginTop: 8 },
  subline: { color: palette.muted, fontSize: 11, lineHeight: 18, marginTop: 2 },
  priceLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.border,
    marginTop: 14,
    paddingVertical: 12,
  },
  price: { color: palette.gold, fontSize: 19, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationIcon: { color: palette.gold, fontSize: 15 },
  location: { color: palette.ivory, fontSize: 10 },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 9,
    backgroundColor: palette.panel,
    marginTop: 14,
    padding: 12,
  },
  noticeMark: {
    width: 17,
    height: 17,
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: palette.gold,
    color: palette.deep,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 17,
  },
  demoNoticeText: { flex: 1, color: palette.ivory, fontSize: 9, lineHeight: 15 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 25, marginBottom: 11 },
  sectionTitle: { color: palette.ivory, fontSize: 24, lineHeight: 30 },
  goldRule: { flex: 1, height: 1, backgroundColor: palette.border },
  factsCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 11,
    backgroundColor: palette.panel,
    paddingHorizontal: 14,
  },
  factRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  factLabel: { color: palette.gold, fontSize: 10 },
  factValue: { flexShrink: 1, color: palette.ivory, fontSize: 10, fontWeight: '600', textAlign: 'right' },
  passport: {
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 14,
    backgroundColor: palette.deep,
    padding: 14,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 13,
  },
  passportTitleGroup: { flexShrink: 1 },
  passportEyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.3 },
  passportTitle: { color: palette.ivory, fontSize: 25, lineHeight: 30, marginTop: 4 },
  passportIdentity: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    paddingHorizontal: 12,
    paddingBottom: 2,
    marginBottom: 9,
  },
  identityHeader: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8 },
  identityIcon: { color: palette.gold, fontSize: 18 },
  identityTitle: { color: palette.ivory, fontSize: 18 },
  recordsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  recordCard: {
    width: '48.5%',
    minHeight: 129,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 9,
    backgroundColor: palette.panel,
    padding: 10,
  },
  recordHeading: { minHeight: 37, flexDirection: 'row', alignItems: 'center', gap: 7 },
  recordIcon: { color: palette.gold, fontSize: 16 },
  recordTitle: { flex: 1, color: palette.ivory, fontSize: 14, lineHeight: 18 },
  recordStatus: { color: palette.gold, fontSize: 9, fontWeight: '700', marginTop: 8 },
  recordDescription: { color: palette.muted, fontSize: 8, lineHeight: 13, marginTop: 4 },
  passportNote: { color: palette.muted, fontSize: 9, lineHeight: 15, marginTop: 11 },
  enquiryButtonOuter: { borderRadius: 26, overflow: 'hidden', marginTop: 22 },
  enquiryButton: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 19,
  },
  enquiryIcon: { color: palette.deep, fontSize: 17 },
  enquiryButtonText: { flex: 1, color: palette.deep, fontSize: 12, fontWeight: '700' },
  enquiryArrow: { color: palette.deep, fontSize: 17 },
  enquiryNote: { color: palette.muted, textAlign: 'center', fontSize: 9, lineHeight: 15, marginTop: 10 },
  notice: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    padding: 15,
    margin: spacing.page,
  },
  noticeText: { flex: 1, color: palette.ivory, fontSize: 11, lineHeight: 17 },
  errorText: { color: '#F2B1A8', fontSize: 11, lineHeight: 17, padding: spacing.page },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
