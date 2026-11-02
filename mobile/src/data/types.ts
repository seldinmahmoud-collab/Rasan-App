export type CountryCode = 'AE' | 'SA' | 'QA' | 'BH' | 'KW' | 'OM';

export type HorsePhoto = {
  url: string;
  altText: string;
};

export type Horse = {
  id: string;
  name: string;
  breed: string;
  age: string;
  sex: string;
  location: string;
  countryCode: CountryCode;
  price: string;
  photos: HorsePhoto[];
  category: string;
  recordStatus: 'illustrative';
  passport: {
    recordId: string;
    status: 'illustrative';
  };
};

export type HorseProvider = {
  list: (countryCode: CountryCode) => Promise<Horse[]>;
  getById: (id: string, countryCode: CountryCode) => Promise<Horse | undefined>;
};

export type ProductPhoto = {
  url: string;
  altText: string;
};

export type StoreProduct = {
  id: string;
  title: string;
  description: string;
  handle: string;
  url?: string;
  availableForSale: boolean;
  hasPricedAvailableVariant: boolean;
  hasPricedInStockVariant: boolean;
  variants: StoreProductVariant[];
  photos: ProductPhoto[];
  collectionIds: string[];
  price: {
    amount: string;
    currencyCode: string;
  };
  maxPrice: {
    amount: string;
    currencyCode: string;
  };
};

export type StoreProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
};

export type StoreCartLine = {
  id: string;
  merchandiseId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  image?: ProductPhoto;
  totalAmount: {
    amount: string;
    currencyCode: string;
  };
};

export type StoreCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalAmount: {
    amount: string;
    currencyCode: string;
  };
  lines: StoreCartLine[];
};

export type StoreCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: ProductPhoto;
};

export type StoreProductPage = {
  products: StoreProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export type StorefrontLanguage = 'EN' | 'AR';

export type ProductProvider = {
  listCollections: (countryCode: CountryCode, language: StorefrontLanguage) => Promise<StoreCollection[]>;
  listProducts: (
    countryCode: CountryCode,
    language: StorefrontLanguage,
    options?: { collectionId?: string; after?: string },
  ) => Promise<StoreProductPage>;
  getProductById: (
    id: string,
    countryCode: CountryCode,
    language: StorefrontLanguage,
  ) => Promise<StoreProduct | null>;
};

export type StoreCartProvider = {
  createCart: (variantId: string, countryCode: CountryCode) => Promise<StoreCart>;
  addCartLine: (cartId: string, variantId: string) => Promise<StoreCart>;
  updateCartLine: (cartId: string, lineId: string, quantity: number) => Promise<StoreCart>;
  removeCartLine: (cartId: string, lineId: string) => Promise<StoreCart>;
  updateCartCountry: (cartId: string, countryCode: CountryCode) => Promise<StoreCart>;
};
