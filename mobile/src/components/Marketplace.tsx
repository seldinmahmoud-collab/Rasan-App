import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import {
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Country, useAppSettings } from '../context/AppSettings';
import type { Horse, HorsePhoto, StoreProduct } from '../data/types';
import { colors, spacing } from '../theme';
import { TypographyText as Text } from './TypographyText';

export function Page({ children }: PropsWithChildren) {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function ShoppingCartIcon({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.cartIconDrawing, { transform: [{ scale: size / 22 }] }]}>
        <View style={styles.cartIconHandle} />
        <View style={styles.cartIconBasket} />
        <View style={[styles.cartIconWheel, styles.cartIconWheelLeft]} />
        <View style={[styles.cartIconWheel, styles.cartIconWheelRight]} />
      </View>
    </View>
  );
}

export function PageHeader({
  back = false,
  cartCount,
  cartLabel,
  onCartPress,
}: {
  back?: boolean;
  cartCount?: number;
  cartLabel?: string;
  onCartPress?: () => void;
}) {
  const { country, countries, locale, setCountry, setLocale, t } = useAppSettings();
  const [countryOpen, setCountryOpen] = useState(false);
  const rtl = locale === 'ar';

  return (
    <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
      <View style={[styles.header, rtl && styles.rowReverse]}>
        <View style={[styles.brand, rtl && styles.rowReverse]}>
          {back ? (
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('back')} style={styles.backButton}>
              <Text style={styles.backArrow}>{rtl ? '›' : '‹'}</Text>
            </Pressable>
          ) : null}
          <Image
            source={require('../../assets/rasan-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
            accessible
            accessibilityLabel="RASAN"
          />
        </View>
        <View style={[styles.headerActions, rtl && styles.rowReverse]}>
          {onCartPress && cartLabel ? (
            <Pressable
              onPress={onCartPress}
              style={styles.cartHeaderButton}
              accessibilityRole="button"
              accessibilityLabel={cartCount ? `${cartLabel}: ${cartCount}` : cartLabel}
            >
              <ShoppingCartIcon size={21} />
              {cartCount ? (
                <View style={styles.cartHeaderBadge}>
                  <Text style={styles.cartHeaderBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
          <Pressable style={styles.marketButton} onPress={() => setCountryOpen(true)} accessibilityRole="button" accessibilityLabel={`${t('country')}: ${country.name}`}>
            <Text style={styles.marketCode}>{country.flag}</Text>
            <Text style={styles.marketChevron}>⌄</Text>
          </Pressable>
          <Pressable onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')} style={styles.languageButton} accessibilityRole="button" accessibilityLabel={t('language')}>
            <Text style={styles.languageText}>{t('language')}</Text>
          </Pressable>
        </View>
      </View>
      <Modal visible={countryOpen} transparent animationType="fade" onRequestClose={() => setCountryOpen(false)}>
        <Pressable style={styles.modalScrim} onPress={() => setCountryOpen(false)}>
          <View style={styles.countrySheet}>
            <Text style={styles.sheetEyebrow}>{t('countryTitle').toUpperCase()}</Text>
            <Text variant="display" style={styles.sheetTitle}>{t('selectCountry')}</Text>
            {countries.map((option: Country) => (
              <Pressable
                key={option.flag}
                style={[styles.countryOption, country.flag === option.flag && styles.countryOptionSelected]}
                onPress={() => { setCountry(option); setCountryOpen(false); }}
              >
                <Text style={styles.countryCode}>{option.flag}</Text>
                <Text style={styles.countryName}>{option.name}</Text>
                {country.flag === option.flag ? <Text style={styles.countryCheck}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { locale } = useAppSettings();
  return (
    <View style={[styles.sectionHeading, locale === 'ar' && styles.rowReverse]}>
      <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action} ↗</Text></Pressable> : null}
    </View>
  );
}

export function SampleLabel({ children }: PropsWithChildren) {
  return <View style={styles.sampleLabel}><Text style={styles.sampleLabelText}>{children}</Text></View>;
}

export function HorseCard({ horse }: { horse: Horse }) {
  const { t, locale } = useAppSettings();
  const photo = horse.photos[0];
  return (
    <Pressable onPress={() => router.push(`/horses/${horse.id}`)} style={styles.horseCard} accessibilityRole="button">
      <HorseImage uri={photo?.url} accessibilityLabel={photo?.altText} style={styles.horseCardImage} />
      <View style={styles.horseCardBody}>
        <View style={[styles.horseCardMeta, locale === 'ar' && styles.rowReverse]}>
          <Text style={[styles.horseCategory, locale === 'ar' && styles.rtlText]}>{horse.category.toUpperCase()}</Text>
          <Text style={styles.sampleDot}>· {t('sample')}</Text>
        </View>
        <Text variant="display" style={[styles.horseName, locale === 'ar' && styles.rtlText]}>{horse.name}</Text>
        <Text style={[styles.horseSub, locale === 'ar' && styles.rtlText]}>{horse.breed}  ·  {horse.age}</Text>
        <View style={[styles.horseCardFooter, locale === 'ar' && styles.rowReverse]}>
          <Text style={styles.horsePrice}>{horse.price}</Text>
          <Text style={styles.horseLocation}>⌖ {horse.location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HorseImage({ uri, accessibilityLabel, style, children }: {
  uri?: string;
  accessibilityLabel?: string;
  style: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const [imageState, setImageState] = useState({ uri, failed: false, loading: Boolean(uri) });
  const currentState = imageState.uri === uri
    ? imageState
    : { uri, failed: false, loading: Boolean(uri) };
  return (
    <View style={[style, styles.photoFrame]}>
      {uri && !currentState.failed ? (
        <ImageBackground
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          imageStyle={styles.imageRadius}
          accessible
          accessibilityLabel={accessibilityLabel}
          onLoadStart={() => setImageState({ uri, failed: false, loading: true })}
          onLoad={() => setImageState({ uri, failed: false, loading: false })}
          onError={() => setImageState({ uri, failed: true, loading: false })}
        >
          {children}
          {currentState.loading ? <ActivityIndicator color={colors.gold} style={styles.imageLoader} /> : null}
        </ImageBackground>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]}>
          <Text style={styles.fallbackWordmark} accessible accessibilityLabel={accessibilityLabel ?? 'RASAN'}>
            RASAN
          </Text>
          {children}
        </View>
      )}
    </View>
  );
}

export function ImageGallery({ photos, style }: { photos: HorsePhoto[]; style: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    if (width > 0) setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.gallery, style]} onLayout={onLayout}>
      {width > 0 && photos.length > 0 ? (
        <ScrollView
          horizontal
          style={styles.galleryScroll}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          accessibilityLabel="Photo gallery"
        >
          {photos.map((photo, index) => (
            <View key={`${photo.url}-${index}`} style={{ width }}>
              <HorseImage uri={photo.url} accessibilityLabel={photo.altText} style={styles.galleryPhoto} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <HorseImage style={styles.galleryPhoto} />
      )}
      {photos.length > 1 ? (
        <View style={styles.galleryDots}>
          {photos.map((photo, index) => (
            <View key={`${photo.url}-dot-${index}`} style={[styles.galleryDot, index === activeIndex && styles.galleryDotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ProductCard({ product, currencyLocale, unavailableLabel, viewProductLabel }: {
  product: StoreProduct;
  currencyLocale: string;
  unavailableLabel: string;
  viewProductLabel: string;
}) {
  const productUrl = product.url;
  const currency = new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency: product.price.currencyCode,
  }).format(Number(product.price.amount));

  return (
    <View style={styles.productCard}>
      <ImageGallery photos={product.photos} style={styles.productGallery} />
      <View style={styles.productBody}>
        <Text variant="display" style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productPrice}>{currency}</Text>
        {!product.availableForSale ? <Text style={styles.unavailable}>{unavailableLabel}</Text> : null}
        {product.description ? <Text numberOfLines={3} style={styles.productDescription}>{product.description}</Text> : null}
        {productUrl ? (
          <Pressable
            accessibilityRole="button"
            style={styles.productLink}
            onPress={() => {
              void Linking.openURL(productUrl).catch(() => {
                Alert.alert('Unable to open product', 'Please try again later.');
              });
            }}
          >
            <Text style={styles.productLinkText}>{viewProductLabel}  ↗</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ContentNotice({ children, loading = false }: PropsWithChildren<{ loading?: boolean }>) {
  return (
    <View style={styles.contentNotice}>
      {loading ? <ActivityIndicator color={colors.forest} /> : null}
      <Text style={styles.contentNoticeText}>{children}</Text>
    </View>
  );
}

export function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, secondary && styles.actionButtonSecondary]} accessibilityRole="button">
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function showDemoEnquiry() {
  Alert.alert('Sample enquiry', 'Seller enquiries are not connected in this demo. No message has been sent.');
}

export async function openRasanShop() {
  try {
    await Linking.openURL('https://www.rasanuae.com');
  } catch {
    Alert.alert('Unable to open the shop', 'Please try again later.');
  }
}

export function BottomTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { t, locale } = useAppSettings();
  const tabLabels: Record<string, string> = {
    index: t('home'), horses: t('horses'), auctions: t('auctions'), shop: t('shop'), account: t('account'),
  };
  const tabMarks: Record<string, string> = { index: '⌂', horses: '♞', auctions: '◇', shop: '▧', account: '○' };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }, locale === 'ar' && styles.rowReverse]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = tabLabels[route.name] ?? descriptors[route.key]?.options?.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={() => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
            style={styles.tabItem}
          >
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{tabMarks[route.name]}</Text>
            <Text numberOfLines={1} style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FactRow({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'passport' }) {
  const { locale } = useAppSettings();
  const passport = tone === 'passport';
  return (
    <View style={[styles.factRow, passport && styles.passportFactRow, locale === 'ar' && styles.rowReverse]}>
      <Text style={[styles.factLabel, passport && styles.passportFactLabel, locale === 'ar' && styles.rtlText]}>{label}</Text>
      <Text style={[styles.factValue, passport && styles.passportFactValue, locale === 'ar' && styles.rtlText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSafeArea: { backgroundColor: colors.headerCharcoal },
  page: { flex: 1, backgroundColor: colors.ivory },
  pageContent: { paddingHorizontal: spacing.page, paddingBottom: 36 },
  header: { minHeight: 65, paddingHorizontal: spacing.page, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.headerCharcoal },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandLogo: { width: 108, height: 46 },
  backButton: { width: 32, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 31, color: colors.ivory, lineHeight: 34 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartHeaderButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartIconDrawing: { width: 22, height: 19, position: 'relative' },
  cartIconHandle: {
    position: 'absolute',
    top: 3,
    left: 1,
    width: 7,
    height: 1.5,
    backgroundColor: colors.gold,
  },
  cartIconBasket: {
    position: 'absolute',
    top: 5,
    left: 7,
    width: 13,
    height: 9,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: colors.gold,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    transform: [{ skewX: '-10deg' }],
  },
  cartIconWheel: {
    position: 'absolute',
    top: 15,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  cartIconWheelLeft: { left: 9 },
  cartIconWheelRight: { left: 17 },
  cartHeaderBadge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 3,
  },
  cartHeaderBadgeText: { color: colors.primaryEmerald, fontSize: 8, fontWeight: '700' },
  marketButton: { minWidth: 52, height: 44, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.gold, backgroundColor: '#303030', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  marketCode: { fontSize: 11, fontWeight: '700', color: colors.ivory, letterSpacing: 1 },
  marketChevron: { color: colors.gold, fontSize: 15, marginTop: -4 },
  languageButton: { minWidth: 48, height: 44, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.gold, backgroundColor: '#303030', alignItems: 'center', justifyContent: 'center' },
  languageText: { color: colors.ivory, fontSize: 13, fontWeight: '600' },
  rowReverse: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17, marginTop: 4 },
  sectionTitle: { color: colors.forest, fontSize: 21, fontWeight: '600' },
  sectionAction: { color: colors.forestLight, fontSize: 12, fontWeight: '700' },
  sampleLabel: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(201,169,110,0.10)', paddingHorizontal: 10, paddingVertical: 6 },
  sampleLabelText: { color: colors.forest, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  horseCard: { backgroundColor: colors.paper, marginBottom: 20, borderWidth: 1, borderColor: colors.line },
  horseCardImage: { height: 232, backgroundColor: colors.forestLight },
  imageRadius: { resizeMode: 'cover' },
  imageFallback: { backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallbackWordmark: { color: colors.gold, fontSize: 13, fontWeight: '700', letterSpacing: 3 },
  photoFrame: { overflow: 'hidden', backgroundColor: colors.forestLight },
  imageLoader: StyleSheet.absoluteFill,
  gallery: { position: 'relative', overflow: 'hidden', backgroundColor: colors.forestLight },
  galleryScroll: { flex: 1 },
  galleryPhoto: { width: '100%', height: '100%' },
  galleryDots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  galleryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  galleryDotActive: { backgroundColor: colors.gold, width: 16 },
  productCard: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, marginBottom: 16 },
  productGallery: { height: 250 },
  productBody: { padding: 18 },
  productTitle: { color: colors.forest, fontSize: 20 },
  productPrice: { color: colors.forest, fontSize: 14, fontWeight: '700', marginTop: 9 },
  productDescription: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 10 },
  unavailable: { color: colors.red, fontSize: 10, fontWeight: '700', marginTop: 5 },
  productLink: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.forest, paddingHorizontal: 13, paddingVertical: 9, marginTop: 13 },
  productLinkText: { color: colors.forest, fontSize: 11, fontWeight: '700' },
  contentNotice: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, padding: 16, marginVertical: 14 },
  contentNoticeText: { flex: 1, color: colors.forestLight, fontSize: 12, lineHeight: 19 },
  horseCardBody: { padding: 18 },
  horseCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  horseCategory: { color: colors.forestLight, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  sampleDot: { color: colors.muted, fontSize: 9 },
  horseName: { color: colors.forest, fontSize: 22, marginTop: 9 },
  horseSub: { color: colors.muted, fontSize: 13, marginTop: 6 },
  horseCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, marginTop: 16, paddingTop: 13 },
  horsePrice: { color: colors.forest, fontSize: 14, fontWeight: '700' },
  horseLocation: { color: colors.muted, fontSize: 11 },
  actionButton: { minHeight: 54, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  actionButtonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.forest },
  actionButtonText: { color: colors.ivory, fontSize: 13, fontWeight: '700' },
  actionButtonTextSecondary: { color: colors.forest },
  tabBar: { minHeight: 70, backgroundColor: colors.charcoal, borderTopWidth: 1, borderTopColor: colors.gold, flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  tabItem: { flex: 1, minWidth: 0, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabIcon: { color: '#B8BDB9', fontSize: 19, height: 23, textAlign: 'center' },
  tabIconActive: { color: colors.gold },
  tabLabel: { color: '#E0E2DE', fontSize: 10, fontWeight: '500' },
  tabLabelActive: { color: colors.gold, fontWeight: '700' },
  modalScrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' },
  countrySheet: { backgroundColor: colors.ivory, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 32, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  sheetEyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: '700', color: colors.forestLight },
  sheetTitle: { color: colors.forest, fontSize: 27, marginTop: 8, marginBottom: 17 },
  countryOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 13, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 4 },
  countryOptionSelected: { backgroundColor: '#F6E8C9' },
  countryCode: { width: 27, color: colors.forestLight, fontSize: 10, fontWeight: '700' },
  countryName: { flex: 1, color: colors.ink, fontSize: 14 },
  countryCheck: { color: colors.forest, fontSize: 16 },
  factRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 },
  factLabel: { color: colors.muted, fontSize: 12 },
  factValue: { color: colors.ink, fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  passportFactRow: { borderBottomColor: '#577167' },
  passportFactLabel: { color: colors.gold },
  passportFactValue: { color: colors.ivory },
});