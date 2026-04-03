export function extractShopifyId(gid) {
  return gid?.split("/").pop() || null;
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
    "style",
    "fit",
    "length",
    "capacity",
    "flavor",
    "scent",
    "finish",
    "pattern",
    "pack size",
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

export function buildProductAttributes(product, variants, metafields) {
  const attributes = {};

  const addValue = (key, value) => {
    if (!key || !value) return;

    const normalizedKey = normalizeKey(key);
    const normalizedValue = String(value).trim();

    if (!normalizedValue) return;

    if (!attributes[normalizedKey]) {
      attributes[normalizedKey] = [];
    }

    if (!attributes[normalizedKey].includes(normalizedValue)) {
      attributes[normalizedKey].push(normalizedValue);
    }
  };

  // system fields
  addValue("productType", product.productType);

  // options from variants (best source)
  for (const variant of variants) {
    for (const option of variant.selectedOptions || []) {
      if (isUsefulOption(option.name, option.value)) {
        addValue(option.name, option.value);
      }
    }
  }

  // metafields
  for (const field of metafields) {
    if (isUsefulMetafield(field)) {
      addValue(field.key, field.value);
    }
  }

  return attributes;
}

export function normalizeShopifyProduct(product) {
  const variants = product.variants?.edges?.map((v) => v.node) || [];
  const images = product.images?.edges?.map((img) => img.node) || [];
  const metafields = product.metafields?.edges?.map((m) => m.node) || [];

  const prices = variants
    .map((v) => parseFloat(v.price || 0))
    .filter((p) => !isNaN(p));

  const comparePrices = variants
    .map((v) => parseFloat(v.compareAtPrice || 0))
    .filter((p) => !isNaN(p));

  const totalInventory = variants.reduce(
    (sum, v) => sum + (v.inventoryQuantity || 0),
    0,
  );

  const availableForSale = variants.some((v) => v.availableForSale);

  const attributes = buildProductAttributes(product, variants, metafields);

  return {
    shopifyGraphqlId: product.id,
    shopifyProductId: extractShopifyId(product.id),

    title: product.title,
    handle: product.handle,
    description: product.description,
    bodyHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags || [],
    status: product.status,

    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    compareAtMinPrice: comparePrices.length ? Math.min(...comparePrices) : null,
    compareAtMaxPrice: comparePrices.length ? Math.max(...comparePrices) : null,

    availableForSale,
    totalInventory,

    featuredImage: product.featuredImage?.url || null,
    images,

    options: product.options || [],
    variants,

    attributes,
    metafields: normalizeMetafields(metafields),

    publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
    createdAtShopify: product.createdAt ? new Date(product.createdAt) : null,
    updatedAtShopify: product.updatedAt ? new Date(product.updatedAt) : null,
  };
}

export function normalizeMetafields(metafields) {
  const result = {};

  for (const field of metafields) {
    const key = `${field.namespace}.${field.key}`;
    result[key] = field.value;
  }

  return result;
}

export async function fetchProductsBatch(admin, cursor = null) {
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
    products: edges.map((edge) => normalizeShopifyProduct(edge.node)),
    nextCursor: edges.length ? edges[edges.length - 1].cursor : null,
    hasNextPage: data?.data?.products?.pageInfo?.hasNextPage || false,
  };
}
