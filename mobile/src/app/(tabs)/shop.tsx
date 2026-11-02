import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ImageGallery, PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { useAppSettings } from '../../context/AppSettings';
import { useShopCart } from '../../context/ShopCart';
import { illustrativeHorsePhotos } from '../../data/illustrativeImages';
import type { StoreCollection, StoreProduct } from '../../data/types';
import { shopifyStorefrontProvider } from '../../data/shopifyStorefrontProvider';
import { homeColors as palette, spacing } from '../../theme';

function ProductCard({
  product,
  locale,
  unavailableLabel,
  priceUnavailableLabel,
  priceNeedsReviewLabel,
  backorderLabel,
  inStockLabel,
  viewProductLabel,
}: {
  product: StoreProduct;
  locale: string;
  unavailableLabel: string;
  priceUnavailableLabel: string;
  priceNeedsReviewLabel: string;
  backorderLabel: string;
  inStockLabel: string;
  viewProductLabel: string;
}) {
  const minAmount = Number(product.price.amount);
  const maxAmount = Number(product.maxPrice.amount);
  const currency = product.price.currencyCode;
  const formatPrice = (amount: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
  const price = Number.isFinite(minAmount) && Number.isFinite(maxAmount)
    ? minAmount === maxAmount
      ? formatPrice(minAmount)
      : `${formatPrice(minAmount)} – ${formatPrice(maxAmount)}`
    : priceUnavailableLabel;
  const canPurchase = product.availableForSale && product.hasPricedAvailableVariant;
  const availability = !canPurchase
    ? unavailableLabel
    : product.hasPricedInStockVariant
      ? inStockLabel
      : backorderLabel;

  return (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${viewProductLabel}: ${product.title}`}
    >
      <View style={styles.productPhotoFrame}>
        <ImageGallery photos={product.photos} style={styles.productGallery} />
        {!canPurchase ? (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>{unavailableLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productBody}>
        <Text variant="display" numberOfLines={2} style={[styles.productTitle, locale === 'ar' && styles.rtlText]}>
          {product.title}
        </Text>
        <Text style={styles.productPrice}>{price}</Text>
        <Text style={[styles.productAvailabilityNote, canPurchase && styles.productAvailabilityAvailable]}>
          {availability}
        </Text>
        {!product.hasPricedAvailableVariant ? (
          <Text style={styles.productAvailabilityNote}>{priceNeedsReviewLabel}</Text>
        ) : null}
        {product.description ? (
          <Text numberOfLines={3} style={[styles.productDescription, locale === 'ar' && styles.rtlText]}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.productLinkOuter}>
          <LinearGradient
            colors={canPurchase ? ['#E6C98D', palette.gold, '#C7A363'] : [palette.panel, palette.panel]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.productLink, !canPurchase && styles.productLinkUnavailable]}
          >
            <Text style={[styles.productLinkText, !canPurchase && styles.productLinkTextUnavailable]}>
              {viewProductLabel}
            </Text>
            <Text style={styles.productLinkArrow}>›</Text>
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
}

export default function ShopScreen() {
  const { t, locale, country } = useAppSettings();
  const { cart } = useShopCart();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const collectionsRequestKey = `${country.flag}:${locale}:${retryCount}`;
  const productsRequestKey = `${collectionsRequestKey}:${selectedCollectionId ?? 'all'}`;
  const language = locale === 'ar' ? 'AR' : 'EN';
  const [collectionResult, setCollectionResult] = useState<{
    key: string;
    collections: StoreCollection[];
    loading: boolean;
    error?: Error;
  }>(() => ({ key: collectionsRequestKey, collections: [], loading: true }));
  const [productResult, setProductResult] = useState<{
    key: string;
    products: StoreProduct[];
    loading: boolean;
    loadingMore: boolean;
    hasNextPage: boolean;
    endCursor: string | null;
    error?: Error;
  }>(() => ({
    key: productsRequestKey,
    products: [],
    loading: true,
    loadingMore: false,
    hasNextPage: false,
    endCursor: null,
  }));

  useEffect(() => {
    let active = true;
    setCollectionResult({ key: collectionsRequestKey, collections: [], loading: true });

    shopifyStorefrontProvider.listCollections(country.flag, language).then((collections) => {
      if (active) setCollectionResult({ key: collectionsRequestKey, collections, loading: false });
    }).catch((requestError: unknown) => {
      if (active) {
        setCollectionResult({
          key: collectionsRequestKey,
          collections: [],
          loading: false,
          error: requestError instanceof Error ? requestError : new Error(String(requestError)),
        });
      }
    });
    return () => { active = false; };
  }, [collectionsRequestKey, country.flag, language]);

  useEffect(() => {
    let active = true;
    setProductResult({
      key: productsRequestKey,
      products: [],
      loading: true,
      loadingMore: false,
      hasNextPage: false,
      endCursor: null,
    });

    shopifyStorefrontProvider.listProducts(country.flag, language, {
      collectionId: selectedCollectionId ?? undefined,
    }).then((page) => {
      if (active) {
        setProductResult({
          key: productsRequestKey,
          ...page,
          loading: false,
          loadingMore: false,
        });
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setProductResult({
          key: productsRequestKey,
          products: [],
          loading: false,
          loadingMore: false,
          hasNextPage: false,
          endCursor: null,
          error: requestError instanceof Error ? requestError : new Error(String(requestError)),
        });
      }
    });
    return () => { active = false; };
  }, [country.flag, language, productsRequestKey, selectedCollectionId]);

  const collectionState = collectionResult.key === collectionsRequestKey
    ? collectionResult
    : { key: collectionsRequestKey, collections: [], loading: true };
  const shopState = productResult.key === productsRequestKey
    ? productResult
    : {
      key: productsRequestKey,
      products: [],
      loading: true,
      loadingMore: false,
      hasNextPage: false,
      endCursor: null,
    };
  const { products, loading, loadingMore, hasNextPage, endCursor, error } = shopState;

  const loadMoreProducts = async () => {
    if (!hasNextPage || !endCursor || loadingMore || loading) return;
    setProductResult((current) => current.key === productsRequestKey
      ? { ...current, loadingMore: true, error: undefined }
      : current);

    try {
      const page = await shopifyStorefrontProvider.listProducts(country.flag, language, {
        after: endCursor,
        collectionId: selectedCollectionId ?? undefined,
      });
      setProductResult((current) => current.key === productsRequestKey
        ? {
          ...current,
          products: [...current.products, ...page.products],
          hasNextPage: page.hasNextPage,
          endCursor: page.endCursor,
          loadingMore: false,
        }
        : current);
    } catch (requestError: unknown) {
      setProductResult((current) => current.key === productsRequestKey
        ? {
          ...current,
          loadingMore: false,
          error: requestError instanceof Error ? requestError : new Error(String(requestError)),
        }
        : current);
    }
  };

  return (
    <View style={styles.screen}>
      <PageHeader
        cartCount={cart?.totalQuantity}
        cartLabel={t('cart')}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <ImageGallery
            photos={[{ url: illustrativeHorsePhotos.arabian, altText: t('illustrativePhotography') }]}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(5, 20, 14, 0.12)', 'rgba(5, 20, 14, 0.45)', 'rgba(5, 20, 14, 0.92)']}
            locations={[0, 0.44, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>RASAN  /  EQUESTRIAN LIFESTYLE</Text>
            <Text variant="display" style={[styles.heroTitle, locale === 'ar' && styles.rtlText]}>
              {t('shopTitle')}
            </Text>
            <Text style={[styles.heroSubtitle, locale === 'ar' && styles.rtlText]}>
              {t('shopBody')}
            </Text>
            <Text style={styles.photoDisclosure}>{t('illustrativePhotography')}</Text>
          </View>
        </View>

        <View style={[styles.collectionHeading, locale === 'ar' && styles.rowReverse]}>
          <View style={styles.headingCopy}>
            <Text style={styles.sectionEyebrow}>{t('shopLink').toUpperCase()}</Text>
            <Text variant="display" style={[styles.sectionTitle, locale === 'ar' && styles.rtlText]}>
              {t('shopCollection')}
            </Text>
          </View>
          <View style={styles.marketPill}>
            <Text style={styles.marketText}>{country.flag}</Text>
          </View>
        </View>

        <View style={[styles.catalogPill, locale === 'ar' && styles.rowReverse]}>
          <Text style={styles.catalogIcon}>◇</Text>
          <Text style={[styles.catalogText, locale === 'ar' && styles.rtlText]}>
            {t('shopifyCatalog')}
          </Text>
          <Text style={styles.catalogMarket}>{country.name}</Text>
        </View>
        <Text style={[styles.commerceDisclosure, locale === 'ar' && styles.rtlText]}>
          {t('shopCommerceNotice')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionFilters}
          accessibilityLabel={t('shopCollectionFilters')}
        >
          <Pressable
            onPress={() => setSelectedCollectionId(null)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCollectionId === null }}
            style={[styles.collectionChip, selectedCollectionId === null && styles.collectionChipSelected]}
          >
            <Text style={[styles.collectionChipText, selectedCollectionId === null && styles.collectionChipTextSelected]}>
              {t('allProducts')}
            </Text>
          </Pressable>
          {collectionState.collections.map((collection) => (
            <Pressable
              key={collection.id}
              onPress={() => setSelectedCollectionId(collection.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCollectionId === collection.id }}
              style={[styles.collectionChip, selectedCollectionId === collection.id && styles.collectionChipSelected]}
            >
              <Text style={[styles.collectionChipText, selectedCollectionId === collection.id && styles.collectionChipTextSelected]}>
                {collection.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {collectionState.loading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.noticeText}>{t('shopCollectionsLoading')}</Text>
          </View>
        ) : null}
        {collectionState.error ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{`${t('shopCollectionsError')} ${collectionState.error.message}`}</Text>
            <Pressable onPress={() => setRetryCount((count) => count + 1)} accessibilityRole="button">
              <Text style={styles.retryText}>{t('shopRetry')}</Text>
            </Pressable>
          </View>
        ) : null}
        {loading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.noticeText}>{t('shopLoading')}</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{`${t('shopError')} ${error.message}`}</Text>
            <Pressable onPress={() => setRetryCount((count) => count + 1)} accessibilityRole="button">
              <Text style={styles.retryText}>{t('shopRetry')}</Text>
            </Pressable>
          </View>
        ) : null}
        {!loading && !error && products.length === 0 ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t('shopEmpty')}</Text>
          </View>
        ) : null}
        {!loading && !error && products.length > 0 ? (
          <View style={styles.productList}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={`${locale}-${country.flag}`}
                unavailableLabel={t('unavailable')}
                priceUnavailableLabel={t('priceUnavailable')}
                priceNeedsReviewLabel={t('priceNeedsReview')}
                backorderLabel={t('availableOnBackorder')}
                inStockLabel={t('inStock')}
                viewProductLabel={t('viewProduct')}
              />
            ))}
          </View>
        ) : null}
        {hasNextPage ? (
          <Pressable
            onPress={loadMoreProducts}
            accessibilityRole="button"
            disabled={loadingMore || loading}
            style={styles.loadMoreButton}
          >
            {loadingMore ? <ActivityIndicator color={palette.gold} /> : null}
            <Text style={styles.loadMoreText}>{loadingMore ? t('shopLoadingMore') : t('shopLoadMore')}</Text>
          </Pressable>
        ) : null}

        <View style={styles.storeLinkPanel}>
          <View style={styles.storeLinkCopy}>
            <Text variant="display" style={[styles.storeLinkTitle, locale === 'ar' && styles.rtlText]}>
              {t('shopTitle')}
            </Text>
            <Text style={[styles.storeLinkNote, locale === 'ar' && styles.rtlText]}>
              {t('shopLeaveNotice')}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              void Linking.openURL('https://www.rasanuae.com').catch(() => {
                Alert.alert('Unable to open the shop', 'Please try again later.');
              });
            }}
            accessibilityRole="link"
            style={styles.storeButtonOuter}
          >
            <LinearGradient
              colors={['#E6C98D', palette.gold, '#C7A363']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.storeButton}
            >
              <Text style={styles.storeButtonText}>{t('shopButton')}</Text>
              <Text style={styles.storeButtonArrow}>↗</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingBottom: 28 },
  hero: { height: 258, marginHorizontal: spacing.page, marginTop: 13, borderRadius: 13, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFill },
  heroContent: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: 18 },
  eyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.4 },
  heroTitle: { color: palette.ivory, fontSize: 31, lineHeight: 37, marginTop: 7 },
  heroSubtitle: { color: '#EFE5D1', fontSize: 10, lineHeight: 16, marginTop: 4, maxWidth: 300 },
  photoDisclosure: { color: palette.gold, fontSize: 8, marginTop: 7 },
  collectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: spacing.page,
    marginTop: 22,
    marginBottom: 12,
  },
  headingCopy: { flex: 1 },
  sectionEyebrow: { color: palette.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.2 },
  sectionTitle: { color: palette.ivory, fontSize: 25, lineHeight: 30, marginTop: 3 },
  marketPill: {
    minWidth: 44,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    backgroundColor: palette.panel,
    paddingHorizontal: 10,
  },
  marketText: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  catalogPill: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    paddingHorizontal: 12,
  },
  catalogIcon: { color: palette.gold, fontSize: 15 },
  catalogText: { flex: 1, color: palette.ivory, fontSize: 10, fontWeight: '600' },
  catalogMarket: { color: palette.muted, fontSize: 8 },
  commerceDisclosure: { color: palette.muted, fontSize: 9, lineHeight: 15, marginHorizontal: spacing.page, marginTop: 8, marginBottom: 5 },
  collectionFilters: { alignItems: 'center', gap: 8, paddingHorizontal: spacing.page, paddingVertical: 8 },
  collectionChip: {
    minHeight: 32,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    backgroundColor: palette.panel,
    paddingHorizontal: 12,
  },
  collectionChipSelected: { backgroundColor: palette.gold, borderColor: palette.gold },
  collectionChipText: { color: palette.ivory, fontSize: 9, fontWeight: '600' },
  collectionChipTextSelected: { color: palette.deep },
  notice: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    marginVertical: 8,
    padding: 13,
  },
  noticeIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: palette.gold,
    color: palette.deep,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 17,
  },
  noticeText: { flex: 1, color: palette.ivory, fontSize: 10, lineHeight: 16 },
  retryText: { color: palette.gold, fontSize: 10, fontWeight: '700' },
  productList: { paddingHorizontal: spacing.page, paddingTop: 10 },
  loadMoreButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    marginBottom: 14,
  },
  loadMoreText: { color: palette.gold, fontSize: 10, fontWeight: '700' },
  productCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    backgroundColor: palette.panel,
    overflow: 'hidden',
    marginBottom: 14,
  },
  productPhotoFrame: { position: 'relative' },
  productGallery: { height: 220, backgroundColor: palette.deep },
  unavailableBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 15,
    backgroundColor: 'rgba(23, 27, 23, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  unavailableBadgeText: { color: palette.ivory, fontSize: 8, fontWeight: '700' },
  productBody: { padding: 14 },
  productTitle: { color: palette.ivory, fontSize: 22, lineHeight: 27 },
  productPrice: { color: palette.gold, fontSize: 13, fontWeight: '700', marginTop: 7 },
  productAvailabilityNote: { color: palette.muted, fontSize: 9, lineHeight: 14, marginTop: 5 },
  productAvailabilityAvailable: { color: palette.gold },
  productDescription: { color: palette.muted, fontSize: 10, lineHeight: 16, marginTop: 8 },
  productLinkOuter: { alignSelf: 'stretch', borderRadius: 22, overflow: 'hidden', marginTop: 13 },
  productLinkOuterDisabled: { opacity: 0.78 },
  productLink: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  productLinkUnavailable: { borderWidth: 1, borderColor: palette.border },
  productLinkText: { color: palette.deep, fontSize: 10, fontWeight: '700' },
  productLinkTextUnavailable: { color: palette.muted },
  productLinkArrow: { color: palette.deep, fontSize: 14 },
  storeLinkPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    backgroundColor: palette.panel,
    marginHorizontal: spacing.page,
    marginTop: 10,
    padding: 14,
  },
  storeLinkCopy: { flex: 1 },
  storeLinkTitle: { color: palette.ivory, fontSize: 17, lineHeight: 21 },
  storeLinkNote: { color: palette.muted, fontSize: 8, lineHeight: 13, marginTop: 4 },
  storeButtonOuter: { borderRadius: 20, overflow: 'hidden' },
  storeButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12 },
  storeButtonText: { color: palette.deep, fontSize: 9, fontWeight: '700' },
  storeButtonArrow: { color: palette.deep, fontSize: 12 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
