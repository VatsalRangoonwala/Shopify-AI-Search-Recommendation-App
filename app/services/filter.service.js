import prisma from "../db.server.js";
import { normalizeKey } from "./product.service.js";

export function toLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function buildFilterQuery(userFilters, priceRange) {
  let query = {};

  userFilters.forEach((value, key) => {
    if (value.source === "system") {
      if (key !== "price") {
        query[value.sourcefield] = { in: value.values };
      } else {
        query.minPrice = { gte: priceRange.min };
        query.maxPrice = { lte: priceRange.max };
      }
    } else if (value.source === "attribute") {
      if (!query.attributes) {
        query.attributes = {};
      }
      query.attributes[value.sourcefield] = { in: value.values };
    }
  });

  return query;
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

// export async function ensureFilterExists(storeId, key) {
//   const normalizedKey = normalizeKey(key);

//   const existing = await prisma.filter.findUnique({
//     where: {
//       storeId_key: {
//         storeId,
//         key: normalizedKey,
//       },
//     },
//   });

//   if (existing) return existing;

//   return prisma.filter.create({
//     data: {
//       storeId,
//       key: normalizedKey,
//       label: toLabel(normalizedKey),
//       source: "attribute",
//       sourceField: normalizedKey,
//       valueType: normalizedKey === "price" ? "range" : "string",
//       uiType: guessUiType(normalizedKey),
//       status: "detected",
//     },
//   });
// }

//   await refreshFilterCounts(filter.id);
// }
// export async function refreshFilterCounts(filterId) {
//   const values = await prisma.filterValue.findMany({
//     where: { filterId },
//     select: {
//       productCount: true,
//     },
//   });

//   const uniqueCount = values.length;
//   const productCount = values.reduce(
//     (max, v) => Math.max(max, v.productCount),
//     0,
//   );

//   await prisma.filter.update({
//     where: { id: filterId },
//     data: {
//       uniqueCount,
//       productCount,
//     },
//   });
// }

// export async function rebuildFiltersForStore(storeId) {
//   // 1. delete old filters + values
//   await prisma.filterValue.deleteMany({
//     where: { storeId },
//   });

//   await prisma.filter.deleteMany({
//     where: { storeId },
//   });

//   // 2. fetch all products
//   const products = await prisma.product.findMany({
//     where: { storeId },
//   });

//   // 3. rebuild incrementally
//   for (const product of products) {
//     await addProductToFilters(product);
//   }

//   return true;
// }

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

  const newCount = filter.productCount - 1;

  if (newCount <= 0) {
    await prisma.filter.delete({
      where: { id: filter.id },
    });
  } else {
    await prisma.filter.update({
      where: { id: filter.id },
      data: {
        productCount: newCount,
      },
    });
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

export async function incrementFilterValue(storeId, key, value) {
  const normalized = key == "price" ? [] : normalizeValue(value);

  const existingValue = await prisma.filter.findUnique({
    where: {
      storeId_key: {
        storeId: filter.storeId,
        key: filter.key,
      },
    },
  });

  if (existingValue && existingValue.value.includes(normalized)) {
    await prisma.filter.update({
      where: { id: existingValue.id },
      data: {
        productCount: { increment: 1 },
      },
    });
  } else {
    await prisma.filter.create({
      data: {
        storeId,
        key: key,
        label: toLabel(key),
        source: key == "price" ? "system" : "attribute",
        sourceField: key == "price" ? "minPrice,maxPrice" : null,
        values: {
          set: [...normalized],
        },
        productCount: 1,
        uniqueCount: 1,
        valueType: key == "price" ? "range" : "string",
        uiType: guessUiType(key),
        status: "selected",
        isVisible: true,
        position: 0,
      },
    });
  }
}

export async function addProductToFilters(product) {
  const extracted = extractFilterableValues(product);

  for (const [key, values] of Object.entries(extracted)) {
    for (const value of values) {
      await incrementFilterValue(product.storeId, key, value);
    }
  }

  // price filter separately
  if (product.minPrice !== null && product.minPrice !== undefined) {
    await incrementFilterValue(product.storeId, "price");
  }
}

export function extractFilterableValues(product, productIdRef) {
  const filterMap = new Map();

  const addFilterValue = (
    key,
    label,
    value,
    source = "attribute",
    sourceField = null,
  ) => {
    if (value === null || value === undefined || value === "") return;

    const normalizedKey = normalizeKey(key);
    const normalizedValue = String(value).trim();

    if (!normalizedValue) return;

    if (!filterMap.has(normalizedKey)) {
      filterMap.set(normalizedKey, {
        key: normalizedKey,
        label,
        source,
        sourceField,
        values: new Set(),
        productIds: new Set(),
      });
    }

    const filter = filterMap.get(normalizedKey);
    filter.values.add(normalizedValue);
  };
  // Brand / Vendor
  if (product.vendor) {
    addFilterValue("brand", "Brand", product.vendor, "system", "vendor");
    filterMap.get("brand")?.productIds.add(productIdRef);
  }

  // Availability
  if (
    product.availableForSale !== null &&
    product.availableForSale !== undefined
  ) {
    addFilterValue(
      "availability",
      "Availability",
      product.availableForSale ? "In Stock" : "Out of Stock",
      "system",
      "availableForSale",
    );
    filterMap.get("availability")?.productIds.add(productIdRef);
  }

  // Dynamic attributes
  const attrs = product.attributes || {};

  Object.entries(attrs).forEach(([attrKey, attrValues]) => {
    const valuesArray = Array.isArray(attrValues) ? attrValues : [attrValues];

    valuesArray.forEach((val) => {
      addFilterValue(attrKey, toLabel(attrKey), val, "attribute", attrKey);
    });

    if (valuesArray.length > 0) {
      filterMap.get(normalizeKey(attrKey))?.productIds.add(productIdRef);
    }
  });

  return filterMap;
}

export async function generateStoreFilters(storeId) {
  const products = await prisma.product.findMany({
    where: {
      storeId,
    },
    select: {
      vendor: true,
      productType: true,
      minPrice: true,
      maxPrice: true,
      availableForSale: true,
      attributes: true,
    },
  });

  let filterMap = new Map();
  products.forEach((product, index) => {
    const productIdRef = `product-${index}`;
    const productFilters = extractFilterableValues(product, productIdRef);

    productFilters.forEach((value, key) => {
      if (!filterMap.has(key)) {
        filterMap.set(key, value);
      } else {
        const existing = filterMap.get(key);

        value.values.forEach((v) => existing.values.add(v));
        value.productIds.forEach((id) => existing.productIds.add(id));
      }
    });
  });
  // Add price as special range filter
  const validPrices = products
    .flatMap((p) => [p.minPrice, p.maxPrice])
    .filter((p) => typeof p === "number" && !isNaN(p));

  if (validPrices.length > 0) {
    filterMap.set("price", {
      key: "price",
      label: "Price",
      source: "system",
      sourceField: "minPrice,maxPrice",
      values: [Math.min(...validPrices), Math.max(...validPrices)],
      productIds: new Set(products.map((_, i) => `product-${i}`)),
      valueType: "range",
      uiType: "slider",
    });
  }

  // Convert map to DB payload
  const filters = Array.from(filterMap.values()).map((filter) => ({
    storeId,
    key: filter.key,
    label: filter.label,
    source: filter.source,
    sourceField: filter.sourceField,
    values: Array.isArray(filter.values)
      ? filter.values
      : Array.from(filter.values).sort(),
    productCount: filter.productIds.size,
    uniqueCount: Array.isArray(filter.values) ? null : filter.values.size,
    valueType: filter.valueType || "string",
    uiType: filter.uiType || guessUiType(filter.key),
    status: "detected",
    isVisible: true,
    position: 0,
  }));

  // Upsert filters
  for (const filter of filters) {
    await prisma.filter.upsert({
      where: {
        storeId_key: {
          storeId: filter.storeId,
          key: filter.key,
        },
      },
      update: {
        label: filter.label,
        source: filter.source,
        sourceField: filter.sourceField,
        values: filter.values,
        productCount: filter.productCount,
        uniqueCount: filter.uniqueCount,
        valueType: filter.valueType,
        uiType: filter.uiType,
        updatedAt: new Date(),
      },
      create: filter,
    });
  }
}
