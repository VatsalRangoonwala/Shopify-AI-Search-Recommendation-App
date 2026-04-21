export function extractShopifyId(gid) {
  try {
    return gid?.split("/").pop();
  } catch (error) {
    return gid;
  }
}

export function parseTagFilter(tag) {
  if (!tag || typeof tag !== "string") return null;

  const normalized = tag.replace(/_/g, "-");
  const parts = normalized.split("-");

  if (parts.length < 2) return null;

  const key = parts[0]?.trim();
  const value = parts.slice(1).join("-").trim();

  if (!key || !value) return null;

  return { key, value };
}

export function isUsefulMetafield(field) {
  if (!field?.key || field?.value === null || field?.value === undefined) {
    return false;
  }

  const allowedMetafieldKeys = [
    "material",
    "fabric",
    "occasion",
    "gender",
    "pattern",
    "finish",
    "sleeve_type",
    "fit",
    "neck_type",
    "skin_type",
    "hair_type",
    "compatibility",
    "device_type",
    "usage",
    "feature",
    "origin",
    "collection_style",
  ];

  const normalizedKey = normalizeKey(field.key);
  const value = String(field.value).trim();

  if (!allowedMetafieldKeys.includes(normalizedKey)) {
    return false;
  }

  if (!value || value.length > 60) {
    return false;
  }

  return true;
}

export function isUsefulOption(name, value) {
  if (!name || !value) return false;

  const allowedOptionKeys = [
    "color",
    "size",
    "material",
    "fabric",
    "gender",
    "style",
    "fit",
    "length",
    "weight",
    "capacity",
    "flavor",
    "scent",
    "finish",
    "pattern",
    "pack size",
    "sleeve_type",
    "neck_type",
    "skin_type",
    "hair_type",
    "compatibility",
    "device_type",
    "usage",
    "feature",
    "origin",
    "collection_style",
  ];

  const normalizedName = normalizeKey(name);

  return allowedOptionKeys.includes(normalizedName);
}

export function normalizeKey(key) {
  return String(key)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

export function normalizeMetafields(metafields) {
  const result = {};

  for (const field of metafields) {
    const key = `${field.namespace}.${field.key}`;
    result[key] = field.value;
  }

  return result;
}

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          1 +
          Math.min(
            matrix[i - 1][j], // deletion
            matrix[i][j - 1], // insertion
            matrix[i - 1][j - 1], // substitution
          );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a, b) {
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);

  if (maxLen === 0) return 1;

  return 1 - distance / maxLen;
}

export function baseNormalize(value) {
  if (!value) return null;

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, " ") // normalize separators
    .replace(/[^\w\s]/g, "") // remove special chars
    .trim();
}

export function resolveCanonicalValue(existingValues, newValue) {
  if (!newValue) return null;

  for (const existing of existingValues) {
    if (Math.abs(existing.length - newValue.length) > 3) continue;

    const score = similarity(existing, newValue);

    if (score > 0.85) {
      return existing;
    }
  }

  return newValue;
}

export function normalizeProductType(productType, types) {
  for (const [type, values] of Object.entries(types)) {
    if (values.includes(productType)) {
      return type;
    }
  }
  return productType;
}

export function buildProductAttributes({
  product = {},
  variants = [],
  metafields = [],
  options = [],
}) {
  const attributes = {};

  const addValue = (key, value) => {
    if (!key || !value) return;

    const normalizedKey = normalizeKey(key);
    const baseVal = baseNormalize(value);

    if (!baseVal) return;

    if (!attributes[normalizedKey]) {
      attributes[normalizedKey] = [];
    }

    const existingValues = attributes[normalizedKey];

    const canonical = resolveCanonicalValue(existingValues, baseVal);

    if (!existingValues.includes(canonical)) {
      existingValues.push(canonical);
    }
  };

  addValue("productType", product.productType);

  // 1. variant selectedOptions (GraphQL best source)
  for (const variant of variants) {
    for (const option of variant.selectedOptions || []) {
      if (isUsefulOption(option.name, option.value)) {
        addValue(option.name, option.value);
      }
    }
  }

  // 2. fallback to product options (Webhook / REST)
  for (const option of options) {
    if (!option?.name) continue;

    for (const value of option.values || []) {
      if (isUsefulOption(option.name, value)) {
        addValue(option.name, value);
      }
    }
  }

  // 3. metafields
  for (const field of metafields) {
    if (isUsefulMetafield(field)) {
      addValue(field.key, field.value);
    }
  }

  return attributes;
}

export async function normalizeShopifyProduct(product, types) {
  const variants = product.variants?.edges?.map((v) => v.node) || [];
  const images = product.images?.edges?.map((img) => img.node) || [];
  const metafields = product.metafields?.edges?.map((m) => m.node) || [];
  const normalizedVariants = variants.map((variant) => ({
    ...variant,
    id: extractShopifyId(variant.id),
  }));
  const normalizedProductType = await normalizeProductType(
    product.productType,
    types,
  );

  const prices = variants
    .map((v) => parseFloat(v.price || 0))
    .filter((p) => !isNaN(p));

  const comparePrices = variants
    .map((v) => parseFloat(v.compareAtPrice || 0))
    .filter((p) => !isNaN(p) && p > 0);

  const totalInventory = variants.reduce(
    (sum, v) => sum + (v.inventoryQuantity || 0),
    0,
  );

  const availableForSale = variants.some((v) => v.availableForSale);

  const attributes = buildProductAttributes({
    product,
    variants,
    metafields,
    options: product.options || [],
  });

  return {
    shopifyGraphqlId: product.id,
    shopifyProductId: extractShopifyId(product.id),

    title: product.title || "",
    handle: product.handle || null,
    description: product.description || null,
    bodyHtml: product.descriptionHtml || null,
    vendor: product.vendor || null,
    productType: normalizedProductType || null,
    tags: product.tags || [],
    status: product.status || null,

    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    compareAtMinPrice: comparePrices.length ? Math.min(...comparePrices) : null,
    compareAtMaxPrice: comparePrices.length ? Math.max(...comparePrices) : null,

    availableForSale,
    totalInventory,

    featuredImage: product.featuredImage?.url || null,
    images,

    options: product.options || [],
    variants: normalizedVariants,
    defaultVariantId: normalizedVariants[0]?.id || null,

    attributes,
    metafields: normalizeMetafields(metafields),

    publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
    createdAtShopify: product.createdAt ? new Date(product.createdAt) : null,
    updatedAtShopify: product.updatedAt ? new Date(product.updatedAt) : null,
  };
}

export function normalizeWebhookProduct(product) {
  const variants = product.variants || [];
  const images = product.images || [];
  const metafields = product.metafields || []; // usually not included in webhook unless fetched separately
  const options = product.options || [];

  const prices = variants
    .map((v) => parseFloat(v.price || 0))
    .filter((p) => !isNaN(p));

  const comparePrices = variants
    .map((v) => parseFloat(v.compare_at_price || 0))
    .filter((p) => !isNaN(p) && p > 0);

  const totalInventory = variants.reduce(
    (sum, v) => sum + (v.inventory_quantity || 0),
    0,
  );

  const availableForSale = variants.some((v) => v.available);

  const normalizedVariants = variants.map((variant) => ({
    ...variant,
    id: extractShopifyId(variant.id),
    selectedOptions: [
      variant.option1 && options[0]?.name
        ? { name: options[0].name, value: variant.option1 }
        : null,
      variant.option2 && options[1]?.name
        ? { name: options[1].name, value: variant.option2 }
        : null,
      variant.option3 && options[2]?.name
        ? { name: options[2].name, value: variant.option3 }
        : null,
    ].filter(Boolean),
  }));

  const attributes = buildProductAttributes({
    product,
    variants: normalizedVariants,
    metafields,
    options,
  });

  return {
    shopifyGraphqlId: product.admin_graphql_api_id || null,
    shopifyProductId: String(product.id),

    title: product.title || "",
    handle: product.handle || null,
    description: product.body_html || null,
    bodyHtml: product.body_html || null,
    vendor: product.vendor || null,
    productType: product.product_type || null,
    tags: Array.isArray(product.tags)
      ? product.tags
      : typeof product.tags === "string"
        ? product.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    status: product.status || null,

    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    compareAtMinPrice: comparePrices.length ? Math.min(...comparePrices) : null,
    compareAtMaxPrice: comparePrices.length ? Math.max(...comparePrices) : null,

    availableForSale,
    totalInventory,

    featuredImage: product.image?.src || images[0]?.src || null,
    images,

    options,
    variants: normalizedVariants,
    defaultVariantId: normalizedVariants[0]?.id || null,

    attributes,
    metafields: normalizeMetafields(metafields),

    publishedAt: product.published_at ? new Date(product.published_at) : null,
    createdAtShopify: product.created_at ? new Date(product.created_at) : null,
    updatedAtShopify: product.updated_at ? new Date(product.updated_at) : null,
  };
}

export async function fetchProductsBatch(admin, cursor = null, productType) {
  const query = `
    query GetProducts($cursor: String) {
      products(first: 50, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            handle
            description
            descriptionHtml
            vendor
            productType
            tags
            status
            createdAt
            updatedAt
            publishedAt

            featuredImage {
              url
              altText
            }

            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }

            options {
              id
              name
              position
              values
            }

            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  barcode
                  price
                  compareAtPrice
                  availableForSale
                  inventoryQuantity
                  taxable
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                  }
                  createdAt
                  updatedAt
                }
              }
            }

            metafields(first: 30) {
              edges {
                node {
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const response = await admin.graphql(query, {
    variables: { cursor },
  });

  const data = await response.json();

  const edges = data?.data?.products?.edges || [];

  return {
    products: edges.map(
      async (edge) => await normalizeShopifyProduct(edge.node, productType),
    ),
    nextCursor: edges.length ? edges[edges.length - 1].cursor : null,
    hasNextPage: data?.data?.products?.pageInfo?.hasNextPage || false,
  };
}

export async function fetchProductType(admin) {
  const query = `query GetProducts($cursor: String) {
  products(first: 250, after: $cursor) {
    edges {
      cursor
      node {
        productType
      }
    }
    pageInfo {
      hasNextPage
      }
    }
  }`;

  let cursor = null;
  let allProductTypes = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await admin.graphql(query, {
      variables: { cursor },
    });
    const data = await response.json();
    const edges = data?.data?.products?.edges;
    allProductTypes.push(...edges.map((p) => p.node.productType));

    cursor = edges.length ? edges[edges.length - 1].cursor : null;
    hasNextPage = data?.data?.products?.pageInfo?.hasNextPage || false;
  }
  return [...new Set(allProductTypes)];
}
