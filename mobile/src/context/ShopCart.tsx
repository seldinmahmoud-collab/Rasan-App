import { createContext, PropsWithChildren, useContext, useState } from 'react';
import type { CountryCode, StoreCart } from '../data/types';
import { shopifyStorefrontProvider } from '../data/shopifyStorefrontProvider';

type ShopCartValue = {
  cart: StoreCart | null;
  addToCart: (variantId: string, countryCode: CountryCode) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  getCheckoutUrl: (countryCode: CountryCode) => Promise<string>;
};

const ShopCartContext = createContext<ShopCartValue | null>(null);

export function ShopCartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [cartCountry, setCartCountry] = useState<CountryCode | null>(null);

  const addToCart = async (variantId: string, countryCode: CountryCode) => {
    let activeCart = cart;
    if (!activeCart) {
      activeCart = await shopifyStorefrontProvider.createCart(variantId, countryCode);
      setCart(activeCart);
      setCartCountry(countryCode);
      return;
    }

    if (cartCountry !== countryCode) {
      activeCart = await shopifyStorefrontProvider.updateCartCountry(activeCart.id, countryCode);
      setCart(activeCart);
      setCartCountry(countryCode);
    }
    const updatedCart = await shopifyStorefrontProvider.addCartLine(activeCart.id, variantId);
    setCart(updatedCart);
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) throw new Error('Your cart is empty.');
    const updatedCart = await shopifyStorefrontProvider.updateCartLine(cart.id, lineId, quantity);
    setCart(updatedCart);
  };

  const removeLine = async (lineId: string) => {
    if (!cart) throw new Error('Your cart is empty.');
    const updatedCart = await shopifyStorefrontProvider.removeCartLine(cart.id, lineId);
    setCart(updatedCart);
  };

  const getCheckoutUrl = async (countryCode: CountryCode) => {
    if (!cart) throw new Error('Your cart is empty.');
    if (cartCountry !== countryCode) {
      const updatedCart = await shopifyStorefrontProvider.updateCartCountry(cart.id, countryCode);
      setCart(updatedCart);
      setCartCountry(countryCode);
      return updatedCart.checkoutUrl;
    }
    return cart.checkoutUrl;
  };

  return (
    <ShopCartContext.Provider value={{ cart, addToCart, updateQuantity, removeLine, getCheckoutUrl }}>
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart() {
  const cart = useContext(ShopCartContext);
  if (!cart) throw new Error('useShopCart must be used within ShopCartProvider');
  return cart;
}
