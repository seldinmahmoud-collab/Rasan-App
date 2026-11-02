import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { HorseImage, PageHeader, ShoppingCartIcon } from '../components/Marketplace';
import { TypographyText as Text } from '../components/TypographyText';
import { useAppSettings } from '../context/AppSettings';
import { useShopCart } from '../context/ShopCart';
import { homeColors as palette, spacing } from '../theme';

function formatPrice(amount: string, currency: string, locale: string) {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(parsedAmount);
}

export default function CartScreen() {
  const { t, locale, country } = useAppSettings();
  const { cart, updateQuantity, removeLine, getCheckoutUrl } = useShopCart();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const currencyLocale = `${locale}-${country.flag}`;

  const runLineOperation = async (lineId: string, operation: () => Promise<void>) => {
    if (busyLineId) return;
    setBusyLineId(lineId);
    try {
      await operation();
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      Alert.alert(t('cartError'), message);
    } finally {
      setBusyLineId(null);
    }
  };

  const openCheckout = async () => {
    if (!cart?.totalQuantity || checkingOut) return;
    setCheckingOut(true);
    try {
      const checkoutUrl = await getCheckoutUrl(country.flag);
      if (!/^https:\/\/[^ ]+$/i.test(checkoutUrl)) {
        throw new Error('Shopify returned an invalid secure checkout URL.');
      }
      await Linking.openURL(checkoutUrl);
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      Alert.alert(t('checkoutError'), message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <View style={styles.screen}>
      <PageHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>RASAN  /  SHOP</Text>
          <Text variant="display" style={styles.title}>{t('cart')}</Text>
        </View>

        {!cart?.lines.length ? (
          <View style={styles.emptyCart}>
            <ShoppingCartIcon size={34} />
            <Text style={styles.emptyCartText}>{t('cartEmpty')}</Text>
            <Pressable onPress={() => router.replace('/(tabs)/shop')} accessibilityRole="button">
              <Text style={styles.continueLink}>{t('continueShopping')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.lines}>
              {cart.lines.map((line) => {
                const busy = busyLineId === line.id;
                return (
                  <View key={line.id} style={styles.line}>
                    <HorseImage
                      uri={line.image?.url}
                      accessibilityLabel={line.image?.altText ?? line.title}
                      style={styles.lineImage}
                    />
                    <View style={styles.lineContent}>
                      <Text variant="display" numberOfLines={2} style={styles.lineTitle}>{line.title}</Text>
                      {line.variantTitle !== 'Default Title' ? (
                        <Text style={styles.lineVariant}>{line.variantTitle}</Text>
                      ) : null}
                      <Text style={styles.linePrice}>
                        {formatPrice(line.totalAmount.amount, line.totalAmount.currencyCode, currencyLocale)}
                      </Text>
                      <View style={styles.lineActions}>
                        <View style={styles.quantityControl}>
                          <Pressable
                            onPress={() => void runLineOperation(line.id, () => (
                              line.quantity === 1
                                ? removeLine(line.id)
                                : updateQuantity(line.id, line.quantity - 1)
                            ))}
                            disabled={Boolean(busyLineId)}
                            accessibilityRole="button"
                            accessibilityLabel={t('quantityDecrease')}
                            style={styles.quantityButton}
                          >
                            <Text style={styles.quantityButtonText}>−</Text>
                          </Pressable>
                          <Text style={styles.quantityValue}>{busy ? '…' : line.quantity}</Text>
                          <Pressable
                            onPress={() => void runLineOperation(line.id, () => updateQuantity(line.id, line.quantity + 1))}
                            disabled={Boolean(busyLineId)}
                            accessibilityRole="button"
                            accessibilityLabel={t('quantityIncrease')}
                            style={styles.quantityButton}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </Pressable>
                        </View>
                        <Pressable
                          onPress={() => void runLineOperation(line.id, () => removeLine(line.id))}
                          disabled={Boolean(busyLineId)}
                          accessibilityRole="button"
                          accessibilityLabel={t('removeItem')}
                        >
                          <Text style={styles.removeText}>{t('removeItem')}</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(cart.subtotalAmount.amount, cart.subtotalAmount.currencyCode, currencyLocale)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(cart.totalAmount.amount, cart.totalAmount.currencyCode, currencyLocale)}
                </Text>
              </View>
              <Text style={styles.totalNote}>{t('checkoutTotalNote')}</Text>
            </View>

            <Pressable
              onPress={() => void openCheckout()}
              disabled={checkingOut || Boolean(busyLineId)}
              accessibilityRole="button"
              accessibilityState={{ disabled: checkingOut || Boolean(busyLineId), busy: checkingOut }}
              style={[styles.checkoutOuter, (checkingOut || Boolean(busyLineId)) && styles.checkoutDisabled]}
            >
              <LinearGradient
                colors={['#E6C98D', palette.gold, '#C7A363']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkoutButton}
              >
                <Text style={styles.checkoutText}>
                  {checkingOut ? `${t('loading')}` : t('checkout')}
                </Text>
                <Text style={styles.checkoutArrow}>›</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { paddingBottom: 34 },
  heading: { marginHorizontal: spacing.page, marginTop: 22, marginBottom: 15 },
  eyebrow: { color: palette.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: palette.ivory, fontSize: 30, lineHeight: 36, marginTop: 5 },
  emptyCart: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: spacing.page,
    marginTop: 22,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    backgroundColor: palette.panel,
    padding: 22,
  },
  emptyCartText: { color: palette.ivory, fontSize: 12 },
  continueLink: { color: palette.gold, fontSize: 11, fontWeight: '700', marginTop: 5 },
  lines: { paddingHorizontal: spacing.page },
  line: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
    marginBottom: 10,
    padding: 11,
  },
  lineImage: { width: 82, height: 92, borderRadius: 8, overflow: 'hidden' },
  lineContent: { flex: 1, justifyContent: 'center' },
  lineTitle: { color: palette.ivory, fontSize: 17, lineHeight: 21 },
  lineVariant: { color: palette.muted, fontSize: 9, marginTop: 3 },
  linePrice: { color: palette.gold, fontSize: 11, fontWeight: '700', marginTop: 6 },
  lineActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  quantityControl: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
  },
  quantityButton: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: palette.gold, fontSize: 16, lineHeight: 20 },
  quantityValue: { minWidth: 24, color: palette.ivory, fontSize: 10, textAlign: 'center' },
  removeText: { color: palette.muted, fontSize: 9, textDecorationLine: 'underline' },
  summary: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    marginHorizontal: spacing.page,
    marginTop: 10,
    paddingTop: 15,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: palette.muted, fontSize: 10 },
  summaryValue: { color: palette.ivory, fontSize: 10, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 11, marginTop: 3 },
  totalLabel: { color: palette.ivory, fontSize: 12, fontWeight: '700' },
  totalValue: { color: palette.gold, fontSize: 13, fontWeight: '700' },
  totalNote: { color: palette.muted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  checkoutOuter: { borderRadius: 24, overflow: 'hidden', marginHorizontal: spacing.page, marginTop: 19 },
  checkoutDisabled: { opacity: 0.7 },
  checkoutButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  checkoutText: { color: palette.deep, fontSize: 11, fontWeight: '700' },
  checkoutArrow: { color: palette.deep, fontSize: 18, lineHeight: 22 },
});
