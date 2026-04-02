import prisma from "../db.server.js";
import { normalizeKey } from "./product.service.js";

export function toLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function buildFilterQuery(filtersConfig, userFilters) {
  let where = {};

  for (const filter of filtersConfig) {
    const userValue = userFilters[filter.name];

    if (!userValue) continue;

    switch (filter.field) {
      case "tags":
        where.tags = {
          hasSome: Array.isArray(userValue) ? userValue : [userValue],
        };
        break;

      case "price":
        where.price = {
          lt: parseFloat(userValue),
        };
        break;

      default:
        break;
    }
  }

  return where;
}

function guessUiType(key) {
  const normalized = normalizeKey(key);

  if (normalized === "price") return "slider";
  if (normalized === "color") return "swatch";
  if (normalized === "size") return "checkbox";
  if (normalized === "brand") return "checkbox";

  return "checkbox";
}

export function normalizeValue(value) {
  return String(value).trim().toLowerCase();
}

export function isUsefulFilterKey(key) {
  const badPatterns = [
    /code/i,
    /sku/i,
    /barcode/i,
    /internal/i,
    /warehouse/i,
    /bin/i,
    /seo/i,
  ];

  return !badPatterns.some((pattern) => pattern.test(key));
}

export function extractFilterableValues(product) {
  const result = {};

  const add = (key, value) => {
    if (!key || value === null || value === undefined || value === "") return;

    const normalizedKey = normalizeKey(key);
    if (!isUsefulFilterKey(normalizedKey)) return;

    const values = Array.isArray(value) ? value : [value];

    for (const v of values) {
      const finalValue = String(v).trim();
      if (!finalValue) continue;

      if (!result[normalizedKey]) result[normalizedKey] = new Set();
      result[normalizedKey].add(finalValue);
    }
  };

  // system fields
  add("brand", product.vendor);
  add("productType", product.productType);

  if (
    product.availableForSale !== null &&
    product.availableForSale !== undefined
  ) {
    add("availability", product.availableForSale ? "In Stock" : "Out of Stock");
  }

  // attributes
  const attrs = product.attributes || {};
  for (const [key, values] of Object.entries(attrs)) {
    add(key, values);
  }

  // convert sets → arrays
  return Object.fromEntries(
    Object.entries(result).map(([key, values]) => [key, Array.from(values)]),
  );
}

export async function ensureFilterExists(storeId, key) {
  const normalizedKey = normalizeKey(key);

  const existing = await prisma.filter.findUnique({
    where: {
      storeId_key: {
        storeId,
        key: normalizedKey,
      },
    },
  });

  if (existing) return existing;

  return prisma.filter.create({
    data: {
      storeId,
      key: normalizedKey,
      label: toLabel(normalizedKey),
      source: "attribute",
      sourceField: normalizedKey,
      valueType: normalizedKey === "price" ? "range" : "string",
      uiType: guessUiType(normalizedKey),
      status: "detected",
    },
  });
}

export async function incrementFilterValue(storeId, key, value) {
  const filter = await ensureFilterExists(storeId, key);
  const normalized = normalizeValue(value);

  const existingValue = await prisma.filterValue.findUnique({
    where: {
      filterId_normalized: {
        filterId: filter.id,
        normalized,
      },
    },
  });

  if (existingValue) {
    await prisma.filterValue.update({
      where: { id: existingValue.id },
      data: {
        productCount: { increment: 1 },
      },
    });
  } else {
    await prisma.filterValue.create({
      data: {
        storeId,
        filterId: filter.id,
        value: String(value).trim(),
        normalized,
        productCount: 1,
      },
    });
  }

  await refreshFilterCounts(filter.id);
}

export async function decrementFilterValue(storeId, key, value) {
  const filter = await prisma.filter.findUnique({
    where: {
      storeId_key: {
        storeId,
        key: normalizeKey(key),
      },
    },
  });

  if (!filter) return;

  const normalized = normalizeValue(value);

  const existingValue = await prisma.filterValue.findUnique({
    where: {
      filterId_normalized: {
        filterId: filter.id,
        normalized,
      },
    },
  });

  if (!existingValue) return;

  const newCount = existingValue.productCount - 1;

  if (newCount <= 0) {
    await prisma.filterValue.delete({
      where: { id: existingValue.id },
    });
  } else {
    await prisma.filterValue.update({
      where: { id: existingValue.id },
      data: {
        productCount: newCount,
      },
    });
  }

  await refreshFilterCounts(filter.id);
}

export async function addProductToFilters(product) {
  console.log(product.storeId, "here");
  const extracted = extractFilterableValues(product);

  for (const [key, values] of Object.entries(extracted)) {
    for (const value of values) {

      await incrementFilterValue(product.storeId, key, value);
    }
  }

  // price filter separately
  if (product.minPrice !== null && product.minPrice !== undefined) {
    await ensureFilterExists(product.storeId, "price");
  }
}

export async function removeProductFromFilters(product) {
  const extracted = extractFilterableValues(product);

  for (const [key, values] of Object.entries(extracted)) {
    for (const value of values) {
      await decrementFilterValue(product.storeId, key, value);
    }
  }
}

export async function refreshFilterCounts(filterId) {
  const values = await prisma.filterValue.findMany({
    where: { filterId },
    select: {
      productCount: true,
    },
  });

  const uniqueCount = values.length;
  const productCount = values.reduce(
    (max, v) => Math.max(max, v.productCount),
    0,
  );

  await prisma.filter.update({
    where: { id: filterId },
    data: {
      uniqueCount,
      productCount,
    },
  });
}

export async function updateFiltersForProductChange(oldProduct, newProduct) {
  const oldValues = extractFilterableValues(oldProduct);
  const newValues = extractFilterableValues(newProduct);

  const allKeys = new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues),
  ]);

  for (const key of allKeys) {
    const oldSet = new Set(oldValues[key] || []);
    const newSet = new Set(newValues[key] || []);

    // removed values
    for (const value of oldSet) {
      if (!newSet.has(value)) {
        await decrementFilterValue(newProduct.storeId, key, value);
      }
    }

    // added values
    for (const value of newSet) {
      if (!oldSet.has(value)) {
        await incrementFilterValue(newProduct.storeId, key, value);
      }
    }
  }

  // ensure price filter exists
  if (newProduct.minPrice !== null && newProduct.minPrice !== undefined) {
    await ensureFilterExists(newProduct.storeId, "price");
  }
}

export async function rebuildFiltersForStore(storeId) {
  // 1. delete old filters + values
  await prisma.filterValue.deleteMany({
    where: { storeId },
  });

  await prisma.filter.deleteMany({
    where: { storeId },
  });

  // 2. fetch all products
  const products = await prisma.product.findMany({
    where: { storeId },
  });

  // 3. rebuild incrementally
  for (const product of products) {
    await addProductToFilters(product);
  }

  return true;
}
