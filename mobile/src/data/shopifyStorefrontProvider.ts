import type {
  CountryCode,
  ProductPhoto,
  ProductProvider,
  StoreCart,
  StoreCartLine,
  StoreCollection,
  StoreCartProvider,
  StoreProduct,
  StoreProductPage,
  StoreProductVariant,
  StorefrontLanguage,
} from './types';

// Verified from Shopify's /admin redirect for rasanuae.com.
const defaultStoreDomain = 'vyie0b-1y.myshopify.com';
const storefrontApiVersion = process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION || '2026-10';

type StorefrontConfiguration = {
  storeDomain: string;
  apiVersion: string;
};

type ShopifyImage = { url: string; altText: string | null };
type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  onlineStoreUrl: string | null;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      currentlyNotInStock: boolean;
      price: { amount: string; currencyCode: string };
    }[];
  };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  collections: { nodes: { id: string }[] };
};
type ShopifyPageInfo = { hasNextPage: boolean; endCursor: string | null };
type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
};
type ShopifyResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};
type ShopifyCartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: { totalAmount: { amount: string; currencyCode: string } };
        merchandise: {
          id: string;
          title: string;
          image: ShopifyImage | null;
          product: { title: string };
        };
      };
    }[];
  };
};
type ShopifyCartMutationPayload = {
  cart: ShopifyCartNode | null;
  userErrors: { message: string }[];
};
type ShopifyCartMutationResponse = Record<string, ShopifyCartMutationPayload>;
type ShopifyProductConnection = {
  edges: { cursor: string; node: ShopifyProductNode }[];
  pageInfo: ShopifyPageInfo;
};
type ShopifyCollectionConnection = {
  edges: { cursor: string; node: ShopifyCollectionNode }[];
  pageInfo: ShopifyPageInfo;
};
type ShopifyCollectionsResponse = {
  localization: { country: { isoCode: string } };
  collections: ShopifyCollectionConnection;
};

const productFields = `
  id
  title
  handle
  description
  onlineStoreUrl
  availableForSale
  featuredImage { url altText }
  images(first: 10) { edges { node { url altText } } }
  variants(first: 250) {
    nodes {
      id
      title
      availableForSale
      currentlyNotInStock
      price { amount currencyCode }
    }
  }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  collections(first: 10) { nodes { id } }
`;

const productByIdQuery = `
  query RasanProduct(
    $id: ID!
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    localization { country { isoCode } }
    product(id: $id) { ${productFields} }
  }
`;

const productsQuery = `
  query RasanProducts(
    $country: CountryCode!
    $language: LanguageCode!
    $after: String
  ) @inContext(country: $country, language: $language) {
    localization { country { isoCode } }
    products(first: 24, after: $after, sortKey: TITLE) {
      edges { cursor node { ${productFields} } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const collectionProductsQuery = `
  query RasanCollectionProducts(
    $collectionId: ID!
    $country: CountryCode!
    $language: LanguageCode!
    $after: String
  ) @inContext(country: $country, language: $language) {
    localization { country { isoCode } }
    collection(id: $collectionId) {
      products(first: 24, after: $after, sortKey: TITLE) {
        edges { cursor node { ${productFields} } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const collectionsQuery = `
  query RasanCollections(
    $country: CountryCode!
    $language: LanguageCode!
    $after: String
  ) @inContext(country: $country, language: $language) {
    localization { country { isoCode } }
    collections(first: 100, after: $after, sortKey: TITLE) {
      edges {
        cursor
        node {
          id
          title
          handle
          description
          image { url altText }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const cartFields = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 250) {
    edges {
      node {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText }
            product { title }
          }
        }
      }
    }
  }
`;

const createCartMutation = `
  mutation RasanCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ${cartFields} }
      userErrors { message }
    }
  }
`;

const addCartLinesMutation = `
  mutation RasanCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${cartFields} }
      userErrors { message }
    }
  }
`;

const updateCartLinesMutation = `
  mutation RasanCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${cartFields} }
      userErrors { message }
    }
  }
`;

const removeCartLinesMutation = `
  mutation RasanCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${cartFields} }
      userErrors { message }
    }
  }
`;

const updateCartBuyerIdentityMutation = `
  mutation RasanCartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { ${cartFields} }
      userErrors { message }
    }
  }
`;

function getStorefrontConfiguration(): StorefrontConfiguration {
  const storeDomain = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() || defaultStoreDomain;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(storeDomain)) {
    throw new Error('EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN must be a hostname without a scheme or path.');
  }
  if (!/^\d{4}-\d{2}$/.test(storefrontApiVersion)) {
    throw new Error('EXPO_PUBLIC_SHOPIFY_API_VERSION must use the YYYY-MM format.');
  }
  return { storeDomain, apiVersion: storefrontApiVersion };
}

function assertMarketContext(actualCountry: string, requestedCountry: CountryCode) {
  if (actualCountry !== requestedCountry) {
    throw new Error(
      `Shopify returned ${actualCountry} market data for the requested ${requestedCountry} market. Enable this country in Shopify Markets before showing its catalogue.`,
    );
  }
}

async function storefrontRequest<T>(
  query: string,
  variables: Record<string, unknown>,
) {
  const config = getStorefrontConfiguration();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const response = await fetch(`https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API request failed (${response.status}).`);
  }

  const result = await response.json() as ShopifyResponse<T>;
  if (result.errors?.length) {
    throw new Error(`Shopify Storefront API error: ${result.errors.map((error) => error.message).join('; ')}`);
  }
  if (!result.data) {
    throw new Error('Shopify Storefront API returned an invalid response.');
  }
  return result.data;
}

function toStoreProduct(node: ShopifyProductNode, storeDomain: string): StoreProduct {
  const photos: ProductPhoto[] = node.images.edges.map(({ node: image }) => ({
    url: image.url,
    altText: image.altText || node.title,
  }));
  if (node.featuredImage && !photos.some((photo) => photo.url === node.featuredImage?.url)) {
    photos.unshift({
      url: node.featuredImage.url,
      altText: node.featuredImage.altText || node.title,
    });
  }

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    url: node.onlineStoreUrl ?? `https://${storeDomain}/products/${node.handle}`,
    availableForSale: node.availableForSale,
    hasPricedAvailableVariant: node.variants.nodes.some((variant) => (
      variant.availableForSale
      && Number.isFinite(Number(variant.price.amount))
      && Number(variant.price.amount) > 0
    )),
    hasPricedInStockVariant: node.variants.nodes.some((variant) => (
      variant.availableForSale
      && !variant.currentlyNotInStock
      && Number.isFinite(Number(variant.price.amount))
      && Number(variant.price.amount) > 0
    )),
    photos,
    collectionIds: node.collections.nodes.map((collection) => collection.id),
    price: node.priceRange.minVariantPrice,
    maxPrice: node.priceRange.maxVariantPrice,
    variants: node.variants.nodes.map((variant): StoreProductVariant => ({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      currentlyNotInStock: variant.currentlyNotInStock,
      price: variant.price,
    })),
  };
}

function toStoreCart(cart: ShopifyCartNode): StoreCart {
  const lines: StoreCartLine[] = cart.lines.edges.map(({ node }) => ({
    id: node.id,
    merchandiseId: node.merchandise.id,
    title: node.merchandise.product.title,
    variantTitle: node.merchandise.title,
    quantity: node.quantity,
    image: node.merchandise.image
      ? {
        url: node.merchandise.image.url,
        altText: node.merchandise.image.altText || node.merchandise.product.title,
      }
      : undefined,
    totalAmount: node.cost.totalAmount,
  }));
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotalAmount: cart.cost.subtotalAmount,
    totalAmount: cart.cost.totalAmount,
    lines,
  };
}

async function mutateCart(
  query: string,
  variables: Record<string, unknown>,
  operation: string,
): Promise<StoreCart> {
  const response = await storefrontRequest<ShopifyCartMutationResponse>(query, variables);
  const payload = response[operation];
  if (!payload) {
    throw new Error(`Shopify did not return a result for ${operation}.`);
  }
  if (payload.userErrors.length) {
    throw new Error(`Shopify could not update your cart: ${payload.userErrors.map(({ message }) => message).join('; ')}`);
  }
  if (!payload.cart) {
    throw new Error('Shopify did not return an updated cart. Please try again.');
  }
  return toStoreCart(payload.cart);
}

async function getProductPage(
  countryCode: CountryCode,
  language: StorefrontLanguage,
  options: { collectionId?: string; after?: string } = {},
): Promise<StoreProductPage> {
  const variables = {
    country: countryCode,
    language,
    after: options.after ?? null,
  };
  let connection: ShopifyProductConnection;

  if (options.collectionId) {
    const data = await storefrontRequest<{
      localization: { country: { isoCode: string } };
      collection: { products: ShopifyProductConnection } | null;
    }>(collectionProductsQuery, { ...variables, collectionId: options.collectionId });
    assertMarketContext(data.localization.country.isoCode, countryCode);
    if (!data.collection) {
      throw new Error('The selected Shopify collection could not be found.');
    }
    connection = data.collection.products;
  } else {
    const data = await storefrontRequest<{
      localization: { country: { isoCode: string } };
      products: ShopifyProductConnection;
    }>(productsQuery, variables);
    assertMarketContext(data.localization.country.isoCode, countryCode);
    connection = data.products;
  }

  const storeDomain = getStorefrontConfiguration().storeDomain;
  return {
    products: connection.edges.map(({ node }) => toStoreProduct(node, storeDomain)),
    hasNextPage: connection.pageInfo.hasNextPage,
    endCursor: connection.pageInfo.endCursor,
  };
}

export const shopifyStorefrontProvider: ProductProvider & StoreCartProvider = {
  async listCollections(countryCode, language): Promise<StoreCollection[]> {
    const collections: StoreCollection[] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const result: ShopifyCollectionsResponse = await storefrontRequest<ShopifyCollectionsResponse>(
        collectionsQuery,
        { country: countryCode, language, after },
      );
      assertMarketContext(result.localization.country.isoCode, countryCode);

      collections.push(...result.collections.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        image: node.image
          ? { url: node.image.url, altText: node.image.altText || node.title }
          : undefined,
      })));
      hasNextPage = result.collections.pageInfo.hasNextPage;
      after = result.collections.pageInfo.endCursor;
      if (hasNextPage && !after) {
        throw new Error('Shopify returned an incomplete collection page.');
      }
    }

    return collections;
  },

  listProducts: getProductPage,

  async getProductById(id, countryCode, language): Promise<StoreProduct | null> {
    const data = await storefrontRequest<{
      localization: { country: { isoCode: string } };
      product: ShopifyProductNode | null;
    }>(productByIdQuery, { id, country: countryCode, language });
    assertMarketContext(data.localization.country.isoCode, countryCode);
    if (!data.product) return null;
    return toStoreProduct(data.product, getStorefrontConfiguration().storeDomain);
  },

  createCart(variantId: string, countryCode: CountryCode): Promise<StoreCart> {
    return mutateCart(createCartMutation, {
      input: {
        lines: [{ merchandiseId: variantId, quantity: 1 }],
        buyerIdentity: { countryCode },
      },
    }, 'cartCreate');
  },

  addCartLine(cartId: string, variantId: string): Promise<StoreCart> {
    return mutateCart(addCartLinesMutation, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    }, 'cartLinesAdd');
  },

  updateCartLine(cartId: string, lineId: string, quantity: number): Promise<StoreCart> {
    return mutateCart(updateCartLinesMutation, {
      cartId,
      lines: [{ id: lineId, quantity }],
    }, 'cartLinesUpdate');
  },

  removeCartLine(cartId: string, lineId: string): Promise<StoreCart> {
    return mutateCart(removeCartLinesMutation, {
      cartId,
      lineIds: [lineId],
    }, 'cartLinesRemove');
  },

  updateCartCountry(cartId: string, countryCode: CountryCode): Promise<StoreCart> {
    return mutateCart(updateCartBuyerIdentityMutation, {
      cartId,
      buyerIdentity: { countryCode },
    }, 'cartBuyerIdentityUpdate');
  },
};
