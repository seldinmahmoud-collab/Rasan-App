import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { HorseImage, PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { useAppSettings } from '../../context/AppSettings';
import type { Horse } from '../../data/types';
import { useHorseListings } from '../../hooks/useHorseData';
import { homeColors as palette, spacing } from '../../theme';

type FilterKey = 'breed' | 'sex' | 'age' | 'location' | 'price' | 'discipline';
type Filters = Record<FilterKey, string | null>;

const filterKeys: FilterKey[] = ['breed', 'sex', 'age', 'location', 'price', 'discipline'];
const emptyFilters: Filters = {
  breed: null,
  sex: null,
  age: null,
  location: null,
  price: null,
  discipline: null,
};
const filterIcons: Record<FilterKey, string> = {
  breed: '♞',
  sex: '⚥',
  age: '◷',
  location: '⌖',
  price: '◇',
  discipline: '♢',
};

function filterValue(horse: Horse, key: FilterKey) {
  if (key === 'breed') return horse.breed.split('·')[0].trim();
  if (key === 'discipline') return horse.category;
  return horse[key];
}

function DemoLabel({ children }: { children: string }) {
  return (
    <View style={styles.demoLabel}>
      <Text style={styles.demoLabelText}>{children}</Text>
    </View>
  );
}

function HorseListingCard({ horse, width }: { horse: Horse; width: number }) {
  const { t, locale } = useAppSettings();
  const photo = horse.photos[0];
  return (
    <Pressable
      style={[styles.horseCard, { width }]}
      onPress={() => router.push(`/horses/${horse.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${horse.name}, ${t('sample')}, ${horse.location}, ${horse.price}`}
    >
      <HorseImage
        uri={photo?.url}
        accessibilityLabel={photo?.altText}
        style={styles.horseCardImage}
      >
        <LinearGradient
          colors={['rgba(5, 20, 14, 0.02)', 'rgba(5, 20, 14, 0.14)', 'rgba(5, 20, 14, 0.94)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardContent}>
          <DemoLabel>{t('sample')}</DemoLabel>
          <View>
            <Text variant="display" numberOfLines={1} style={[styles.horseName, locale === 'ar' && styles.rtlText]}>
              {horse.name}
            </Text>
            <Text numberOfLines={1} style={[styles.horseMeta, locale === 'ar' && styles.rtlText]}>
              {horse.breed.split('·')[0].trim()} · {horse.sex} · {horse.age}
            </Text>
            <View style={[styles.cardLocationRow, locale === 'ar' && styles.rowReverse]}>
              <Text style={styles.locationIcon}>⌖</Text>
              <Text numberOfLines={1} style={[styles.horseLocation, locale === 'ar' && styles.rtlText]}>
                {horse.location}
              </Text>
            </View>
            <View style={[styles.cardFooter, locale === 'ar' && styles.rowReverse]}>
              <Text numberOfLines={1} style={styles.horsePrice}>{horse.price}</Text>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>{locale === 'ar' ? '↙' : '↗'}</Text>
              </View>
            </View>
          </View>
        </View>
      </HorseImage>
    </Pressable>
  );
}

export default function HorsesScreen() {
  const { t, locale, country } = useAppSettings();
  const { horses, loading, error } = useHorseListings(country.flag);
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const cardWidth = Math.max(130, (windowWidth - spacing.page * 2 - 12) / 2);

  const filterOptions = useMemo(() => Object.fromEntries(
    filterKeys.map((key) => [
      key,
      [...new Set(horses.map((horse) => filterValue(horse, key)))].sort((a, b) => a.localeCompare(b)),
    ]),
  ) as Record<FilterKey, string[]>, [horses]);

  const filteredHorses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return horses.filter((horse) => {
      const matchesQuery = !normalizedQuery || [
        horse.name,
        horse.breed,
        horse.sex,
        horse.age,
        horse.location,
        horse.price,
        horse.category,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      if (!matchesQuery) return false;
      return filterKeys.every((key) => {
        const selected = filters[key];
        return selected === null || filterValue(horse, key) === selected;
      });
    });
  }, [filters, horses, query]);

  const activeFilterCount = filterKeys.filter((key) => filters[key] !== null).length;
  const filterLabel = (key: FilterKey) => {
    const value = filters[key];
    if (!value) return t(`filter${key[0].toUpperCase()}${key.slice(1)}` as Parameters<typeof t>[0]);
    return value;
  };

  return (
    <View style={styles.screen}>
      <PageHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.eyebrow, locale === 'ar' && styles.rtlText]}>
          {t('sampleData').toUpperCase()}  /  {country.flag}
        </Text>
        <Text variant="display" style={[styles.title, locale === 'ar' && styles.rtlText]}>
          {t('allHorses')}
        </Text>
        <Text style={[styles.subtitle, locale === 'ar' && styles.rtlText]}>
          {t('browse')}
        </Text>

        <View style={[styles.searchBar, locale === 'ar' && styles.rowReverse]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('horseSearchPlaceholder')}
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, locale === 'ar' && styles.rtlText]}
            accessibilityLabel={t('horseSearchPlaceholder')}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel={t('clearSearch')}
              hitSlop={8}
            >
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.filterHeadingRow, locale === 'ar' && styles.rowReverse]}>
          <Text style={styles.filterHeading}>{t('filterBy').toUpperCase()}</Text>
          {activeFilterCount > 0 || query.length > 0 ? (
            <Pressable
              onPress={() => {
                setFilters(emptyFilters);
                setQuery('');
              }}
              accessibilityRole="button"
            >
              <Text style={styles.clearFilters}>{t('clearFilters')}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.filterGrid, locale === 'ar' && styles.rowReverse]}>
          {filterKeys.map((key) => (
            <Pressable
              key={key}
              onPress={() => setOpenFilter(key)}
              style={[styles.filterChip, filters[key] !== null && styles.filterChipSelected]}
              accessibilityRole="button"
              accessibilityLabel={`${t(`filter${key[0].toUpperCase()}${key.slice(1)}` as Parameters<typeof t>[0])}: ${filterLabel(key)}`}
              accessibilityState={{ selected: filters[key] !== null }}
            >
              <Text style={styles.filterIcon}>{filterIcons[key]}</Text>
              <Text numberOfLines={1} style={styles.filterText}>{filterLabel(key)}</Text>
              <Text style={styles.filterChevron}>⌄</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.resultsHeading, locale === 'ar' && styles.rowReverse]}>
          <View style={styles.resultsTextGroup}>
            <Text variant="display" style={styles.resultsCount}>
              {filteredHorses.length}
            </Text>
            <Text style={styles.resultsLabel}>{t('sampleListings')}</Text>
          </View>
          <DemoLabel>{t('demoData')}</DemoLabel>
        </View>

        <Text style={[styles.disclosure, locale === 'ar' && styles.rtlText]}>
          {t('horseDemoNotice')}
        </Text>

        {loading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.noticeText}>{t('loading')}</Text>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{`${t('loadError')} ${error.message}`}</Text> : null}
        {!loading && !error && filteredHorses.length > 0 ? (
          <View style={styles.horseGrid}>
            {filteredHorses.map((horse) => (
              <HorseListingCard key={horse.id} horse={horse} width={cardWidth} />
            ))}
          </View>
        ) : null}
        {!loading && !error && filteredHorses.length === 0 ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {horses.length === 0 ? t('noHorsesInMarket') : t('noHorseFilterResults')}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={openFilter !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenFilter(null)}
      >
        <View style={styles.modalScrim}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpenFilter(null)}
            accessibilityLabel={t('back')}
          />
          <View style={styles.filterSheet}>
            {openFilter ? (
              <>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetEyebrow}>{t('filterBy').toUpperCase()}</Text>
                <Text variant="display" style={styles.sheetTitle}>
                  {t(`filter${openFilter[0].toUpperCase()}${openFilter.slice(1)}` as Parameters<typeof t>[0])}
                </Text>
                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  <Pressable
                    onPress={() => {
                      setFilters((current) => ({ ...current, [openFilter]: null }));
                      setOpenFilter(null);
                    }}
                    style={styles.filterOption}
                    accessibilityRole="button"
                  >
                    <Text style={styles.filterOptionText}>{t('filterAny')}</Text>
                    {filters[openFilter] === null ? <Text style={styles.optionCheck}>✓</Text> : null}
                  </Pressable>
                  {filterOptions[openFilter].map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setFilters((current) => ({ ...current, [openFilter]: option }));
                        setOpenFilter(null);
                      }}
                      style={styles.filterOption}
                      accessibilityRole="button"
                      accessibilityState={{ selected: filters[openFilter] === option }}
                    >
                      <Text style={styles.filterOptionText}>{option}</Text>
                      {filters[openFilter] === option ? <Text style={styles.optionCheck}>✓</Text> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingHorizontal: spacing.page, paddingTop: 16, paddingBottom: 30 },
  eyebrow: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: palette.ivory, fontSize: 33, lineHeight: 40, marginTop: 8 },
  subtitle: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 3, marginBottom: 16 },
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 24,
    backgroundColor: palette.panel,
    paddingHorizontal: 15,
  },
  searchIcon: { color: palette.gold, fontSize: 23, lineHeight: 28 },
  searchInput: { flex: 1, minWidth: 0, color: palette.ivory, fontSize: 12, paddingVertical: 9 },
  clearSearch: { color: palette.gold, fontSize: 22, lineHeight: 26 },
  filterHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
    marginBottom: 8,
  },
  filterHeading: { color: palette.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.4 },
  clearFilters: { color: palette.gold, fontSize: 10, fontWeight: '600' },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    width: '30%',
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: palette.panel,
    paddingHorizontal: 6,
  },
  filterChipSelected: { backgroundColor: '#153F30', borderColor: palette.gold },
  filterIcon: { color: palette.gold, fontSize: 13 },
  filterText: { flexShrink: 1, color: palette.ivory, fontSize: 9, fontWeight: '600' },
  filterChevron: { color: palette.gold, fontSize: 12, marginTop: -4 },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    marginTop: 17,
    paddingTop: 14,
    marginBottom: 6,
  },
  resultsTextGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  resultsCount: { color: palette.gold, fontSize: 25, lineHeight: 30 },
  resultsLabel: { color: palette.ivory, fontSize: 10 },
  demoLabel: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: 'rgba(23, 27, 23, 0.48)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  demoLabelText: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  disclosure: { color: palette.muted, fontSize: 9, lineHeight: 14, marginBottom: 13 },
  horseGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11 },
  horseCard: {
    height: 245,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.deep,
    overflow: 'hidden',
  },
  horseCardImage: { flex: 1, backgroundColor: palette.deep },
  cardContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 9,
  },
  horseName: { color: palette.ivory, fontSize: 18, lineHeight: 23 },
  horseMeta: { color: '#E8DDC7', fontSize: 8, lineHeight: 14, marginTop: 2 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  locationIcon: { color: palette.gold, fontSize: 12 },
  horseLocation: { flex: 1, color: '#E8DDC7', fontSize: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 7,
  },
  horsePrice: { flex: 1, color: palette.gold, fontSize: 10, fontWeight: '700' },
  cardArrow: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: palette.gold,
  },
  cardArrowText: { color: palette.deep, fontSize: 13 },
  notice: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    padding: 14,
    marginVertical: 10,
  },
  noticeText: { flex: 1, color: palette.ivory, fontSize: 11, lineHeight: 17 },
  errorText: { color: '#F2B1A8', fontSize: 11, lineHeight: 17, paddingVertical: 14 },
  modalScrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  filterSheet: {
    maxHeight: '72%',
    backgroundColor: palette.deep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: palette.gold,
    paddingHorizontal: 21,
    paddingTop: 11,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 34,
    height: 3,
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: palette.border,
    marginBottom: 15,
  },
  sheetEyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  sheetTitle: { color: palette.ivory, fontSize: 26, marginTop: 4, marginBottom: 9 },
  optionsList: { flexGrow: 0 },
  filterOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    paddingHorizontal: 5,
  },
  filterOptionText: { color: palette.ivory, fontSize: 12 },
  optionCheck: { color: palette.gold, fontSize: 16 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
