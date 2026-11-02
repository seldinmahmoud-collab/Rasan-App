import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ImageGallery, PageHeader } from '../../components/Marketplace';
import { TypographyText as Text } from '../../components/TypographyText';
import { useAppSettings } from '../../context/AppSettings';
import { useShopCart } from '../../context/ShopCart';
import type { StoreProduct, StoreProductVariant } from '../../data/types';
import { shopifyStorefrontProvider } from '../../data/shopifyStorefrontProvider';
import { homeColors as palette, spacing } from '../../theme';

function formatPrice(amount: string, currency: string, locale: string) {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount)) return null;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(parsedAmount);
}

function variantIsPurchasable(variant: StoreProductVariant) {
  const amount = Number(variant.price.amount);
  return variant.availableForSale && Number.isFinite(amount) && amount > 0;
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { t, locale, country } = useAppSettings();
  const { cart, addToCart } = useShopCart();
  const language = locale === 'ar' ? 'AR' : 'EN';
  const requestKey = `${productId ?? ''}:${country.flag}:${language}`;
  const [result, setResult] = useState<{
    key: string;
    product: StoreProduct | null;
    selectedVariantId: string | null;
    loading: boolean;
    error?: Error;
  }>({ key: '', product: null, selectedVariantId: null, loading: true });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let active = true;
    if (!productId) {
      return () => { active = false; };
    }

    shopifyStorefrontProvider.getProductById(productId, country.flag, language).then((result) => {
      if (active) {
        const preferredVariant = result?.variants.find(variantIsPurchasable) ?? result?.variants[0];
        setResult({
          key: requestKey,
          product: result,
          selectedVariantId: preferredVariant?.id ?? null,
          loading: false,
        });
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setResult({
          key: requestKey,
          product: null,
          selectedVariantId: null,
          loading: false,
          error: requestError instanceof Error ? requestError : new Error(String(requestError)),
        });
      }
    });
    return () => { active = false; };
  }, [country.flag, language, productId, requestKey]);

  const screenState = !productId
    ? {
      key: requestKey,
      product: null,
      selectedVariantId: null,
      loading: false,
      error: new Error('The Shopify product could not be identified.'),
    }
    : result.key === requestKey
      ? result
      : { key: requestKey, product: null, selectedVariantId: null, loading: true };
  const { product, loading, error } = screenState;
  const selectedVariant = product?.variants.find((variant) => variant.id === screenState.selectedVariantId);
  const canAddToCart = selectedVariant ? variantIsPurchasable(selectedVariant) : false;
  const selectedPrice = selectedVariant
    ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode, `${locale}-${country.flag}`)
    : null;
  const galleryHeight = 360;

  const handleAddToCart = async () => {
    if (!selectedVariant || !canAddToCart || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(selectedVariant.id, country.flag);
      Alert.alert(t('addedToCart'), product?.title ?? '', [
        { text: t('continueShopping'), style: 'cancel' },
        { text: t('viewCart'), onPress: () => router.push('/cart') },
      ]);
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      Alert.alert(t('cartError'), message);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <View style={styles.screen}>
      <PageHeader
        back
        cartCount={cart?.totalQuantity}
        cartLabel={t('cart')}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.noticeText}>{t('loading')}</Text>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{`${t('loadError')} ${error.message}`}</Text> : null}
        {!loading && !error && !product ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t('shopEmpty')}</Text>
          </View>
        ) : null}
        {product ? (
          <>
            <ImageGallery photos={product.photos} style={[styles.gallery, { height: galleryHeight }]} />
            <View style={styles.content}>
              <Text style={styles.eyebrow}>RASAN  /  SHOP</Text>
              <Text variant="display" style={[styles.title, locale === 'ar' && styles.rtlText]}>
                {product.title}
              </Text>
              <Text style={styles.price}>
                {selectedPrice ?? formatPrice(
                  product.price.amount,
                  product.price.currencyCode,
                  `${locale}-${country.flag}`,
                ) ?? t('priceUnavailable')}
              </Text>

              <Text variant="display" style={styles.sectionTitle}>{t('variants')}</Text>
              {product.variants.length ? product.variants.map((variant) => {
                const purchasable = variantIsPurchasable(variant);
                const variantPrice = formatPrice(
                  variant.price.amount,
                  variant.price.currencyCode,
                  `${locale}-${country.flag}`,
                ) ?? t('priceUnavailable');
                const stockStatus = !purchasable
                  ? t('unavailable')
                  : variant.currentlyNotInStock
                    ? t('availableOnBackorder')
                    : t('inStock');
                const selected = variant.id === screenState.selectedVariantId;
                return (
                  <Pressable
                    key={variant.id}
                    onPress={() => setResult((current) => current.key === requestKey
                      ? { ...current, selectedVariantId: variant.id }
                      : current)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[styles.variantRow, selected && styles.variantRowSelected]}
                  >
                    <View style={styles.variantCopy}>
                      <Text style={[styles.variantTitle, locale === 'ar' && styles.rtlText]}>
                        {variant.title}
                      </Text>
                      <Text style={[styles.variantAvailability, purchasable && styles.variantAvailable]}>
                        {`${t('stockStatus')}: ${stockStatus}`}
                      </Text>
                    </View>
                    <Text style={styles.variantPrice}>{variantPrice}</Text>
                  </Pressable>
                );
              }) : (
                <Text style={styles.emptyVariants}>{t('unavailable')}</Text>
              )}

              <View style={styles.descriptionSection}>
                <Text variant="display" style={styles.sectionTitle}>{t('productDescription')}</Text>
                <Text style={[styles.description, locale === 'ar' && styles.rtlText]}>
                  {product.description || t('descriptionUnavailable')}
                </Text>
              </View>

              <Pressable
                onPress={handleAddToCart}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canAddToCart || addingToCart, busy: addingToCart }}
                disabled={!canAddToCart || addingToCart}
                style={[styles.addButtonOuter, (!canAddToCart || addingToCart) && styles.addButtonDisabled]}
              >
                <LinearGradient
                  colors={canAddToCart ? ['#E6C98D', palette.gold, '#C7A363'] : [palette.panel, palette.panel]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.addButton, locale === 'ar' && styles.rowReverse]}
                >
                  {addingToCart ? <ActivityIndicator color={palette.deep} /> : null}
                  <Text style={[styles.addButtonText, !canAddToCart && styles.addButtonTextDisabled]}>
                    {addingToCart ? t('addingToCart') : canAddToCart ? t('addToCart') : t('unavailable')}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingBottom: 34 },
  gallery: { marginHorizontal: spacing.page, marginTop: 16, borderRadius: 13, overflow: 'hidden' },
  content: { paddingHorizontal: spacing.page, paddingTop: 20 },
  eyebrow: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: palette.ivory, fontSize: 32, lineHeight: 38, marginTop: 7 },
  price: { color: palette.gold, fontSize: 17, fontWeight: '700', marginTop: 8 },
  sectionTitle: { color: palette.ivory, fontSize: 23, lineHeight: 28, marginTop: 24, marginBottom: 10 },
  variantRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
    marginBottom: 8,
    paddingHorizontal: 13,
  },
  variantRowSelected: { borderColor: palette.gold, backgroundColor: '#104333' },
  variantCopy: { flex: 1, paddingRight: 10 },
  variantTitle: { color: palette.ivory, fontSize: 11, fontWeight: '600' },
  variantAvailability: { color: palette.muted, fontSize: 9, marginTop: 5 },
  variantAvailable: { color: palette.gold },
  variantPrice: { color: palette.gold, fontSize: 11, fontWeight: '700' },
  emptyVariants: { color: palette.muted, fontSize: 10 },
  descriptionSection: { marginTop: 5 },
  description: { color: palette.muted, fontSize: 11, lineHeight: 18 },
  addButtonOuter: { borderRadius: 24, overflow: 'hidden', marginTop: 24 },
  addButtonDisabled: { opacity: 0.75 },
  addButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  addButtonText: { color: palette.deep, fontSize: 12, fontWeight: '700' },
  addButtonTextDisabled: { color: palette.muted },
  notice: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: spacing.page,
    marginTop: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.panel,
  },
  noticeText: { color: palette.ivory, fontSize: 11, lineHeight: 17 },
  errorText: { color: palette.ivory, fontSize: 11, lineHeight: 17, margin: spacing.page },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
});
