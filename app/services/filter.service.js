import prisma from "../db.server.js";
import { normalizeKey } from "./product.service.js";

export function toLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function buildFilterQuery(filterConfig, userFilters) {
  if (!userFilters || Object.keys(userFilters).length === 0) return {};

  const query = {};
  const orConditions = [];

  for (const filter of filterConfig) {
    const value = userFilters[filter.key];
    if (!value || !Array.isArray(value) || value.length === 0) continue;

    if (filter.key === "price") {
      query.minPrice = { gte: parseFloat(value[0]) };
      query.maxPrice = { lte: parseFloat(value[1]) };
      continue;
    }

    if (filter.source !== "attribute") {
      if (filter.sourceField === "availableForSale") {
        query[filter.sourceField] = value[0] !== "Out of Stock";
      } else {
        query[filter.sourceField] = { in: value };
      }
      continue;
    }

    for (const v of value) {
      orConditions.push({
        attributes: {
          path: [filter.sourceField],
          array_contains: v,
        },
      });
    }
  }

  if (orConditions.length > 0) {
    query.OR = orConditions;
  }

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
  return String(value).trim();
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
  return;
}

export async function decrementFilterValue(
  storeId,
  key,
  value,
  isFirstValue,
  product,
) {
  const normalizedKey = normalizeKey(key);
  const isPrice = normalizedKey === "price";

  const existingFilter = await prisma.filter.findUnique({
    where: {
      storeId_key: {
        storeId,
        key: normalizedKey,
      },
    },
  });

  if (!existingFilter) return null;
  if (isPrice) {
    await prisma.filter.update({
      where: { id: existingFilter.id },
      data: {
        ...(isFirstValue && {
          productCount: { decrement: 1 },
        }),
      },
    });

    const updatedFilter = await prisma.filter.findUnique({
      where: { id: existingFilter.id },
    });

    if (updatedFilter.productCount <= 0) {
      await prisma.filter.delete({ where: { id: existingFilter.id } });
    }

    return;
  }

  const normalizedValue = normalizeValue(value);
  if (!normalizedValue) return null;

  let whereCondition = {
    storeId,
    NOT: { id: product.id },
  };

  // 🔥 SYSTEM FIELDS
  if (normalizedKey === "brand") {
    whereCondition.vendor = normalizedValue;
  } else if (normalizedKey === "availability") {
    whereCondition.availableForSale = normalizedValue === "In Stock";
  }

  // 🔥 ATTRIBUTE FIELDS (dynamic JSON)
  else {
    whereCondition.attributes = {
      path: [normalizedKey],
      array_contains: [normalizedValue],
    };
  }

  // 🔍 Check if value still exists in other products
  const stillExists = await prisma.product.findFirst({
    where: whereCondition,
  });

  let updatedValues = existingFilter.values;

  if (!stillExists) {
    updatedValues = existingFilter.values.filter((v) => v !== normalizedValue);
  }

  await prisma.filter.update({
    where: { id: existingFilter.id },
    data: {
      values: {
        set: updatedValues,
      },
      ...(isFirstValue && {
        productCount: { decrement: 1 },
      }),
    },
  });

  const updatedFilter = await prisma.filter.findUnique({
    where: { id: existingFilter.id },
  });

  if (updatedFilter.productCount <= 0) {
    await prisma.filter.delete({ where: { id: existingFilter.id } });
  }
}

export async function removeProductFromFilters(product) {
  const extracted = extractFilterableValues(product);

  for (const [key, filterObj] of extracted.entries()) {
    const values = Array.from(filterObj.values);

    let isFirstValue = true;
    for (const value of values) {
      await decrementFilterValue(
        product.storeId,
        key,
        value,
        isFirstValue,
        product,
      );
      isFirstValue = false;
    }
  }
  return;
}

export async function incrementFilterValue(storeId, key, value, isFirstValue) {
  const normalizedKey = normalizeKey(key);
  const isPrice = normalizedKey === "price";

  const existingFilter = await prisma.filter.findUnique({
    where: {
      storeId_key: {
        storeId,
        key: normalizedKey,
      },
    },
  });

  // ----------------------------
  // PRICE FILTER (special case)
  // ----------------------------
  if (isPrice) {
    if (existingFilter) {
      return prisma.filter.update({
        where: {
          id: existingFilter.id,
        },
        data: {
          productCount: {
            increment: 1,
          },
        },
      }); // price filter already exists, no need to increment blindly
    }

    return prisma.filter.create({
      data: {
        storeId,
        key: "price",
        label: "Price",
        source: "system",
        sourceField: "minPrice,maxPrice",
        values: [],
        productCount: 0,
        uniqueCount: 0,
        valueType: "range",
        uiType: "slider",
        status: "selected",
        isVisible: true,
        position: 0,
      },
    });
  }

  // ----------------------------
  // NORMAL FILTERS
  // ----------------------------
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) return null;

  // Filter exists already
  if (existingFilter) {
    const currentValues = existingFilter.values || [];
    const alreadyExists = currentValues.includes(normalizedValue);

    return prisma.filter.update({
      where: { id: existingFilter.id },
      data: {
        values: alreadyExists
          ? currentValues
          : {
              set: [...currentValues, normalizedValue],
            },
        uniqueCount: alreadyExists
          ? existingFilter.uniqueCount
          : existingFilter.uniqueCount + 1,
        productCount: isFirstValue
          ? { increment: 1 }
          : existingFilter.productCount,
      },
    });
  }

  // Filter does not exist yet
  return prisma.filter.create({
    data: {
      storeId,
      key: normalizedKey,
      label: toLabel(normalizedKey),
      source: ["brand", "productType", "availability"].includes(normalizedKey)
        ? "system"
        : "attribute",
      sourceField: normalizedKey,
      values: [normalizedValue],
      productCount: 1,
      uniqueCount: 1,
      valueType: "string",
      uiType: guessUiType(normalizedKey),
      status: "selected",
      isVisible: true,
      position: 0,
    },
  });
}

export async function addProductToFilters(product) {
  const extracted = extractFilterableValues(product, product.id);

  for (const [key, filterObj] of extracted.entries()) {
    const values = Array.from(filterObj.values);

    let isFirstValue = true;
    for (const value of values) {
      await incrementFilterValue(product.storeId, key, value, isFirstValue);
      isFirstValue = false;
    }
  }

  if (product.minPrice != null) {
    await incrementFilterValue(product.storeId, "price", null);
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
      values: [
        Math.min(...validPrices).toString(),
        Math.max(...validPrices).toString(),
      ],
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
