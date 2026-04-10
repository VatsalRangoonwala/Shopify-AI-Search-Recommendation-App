import {
  Page,
  BlockStack,
  Card,
  Text,
  TextField,
  Button,
} from "@shopify/polaris";
import { useFetcher, useLoaderData } from "react-router";
import FilterSettings from "../components/settings/FilterSettings.jsx";
import ProductSetting from "../components/settings/ProductSetting.jsx";
import SortingSettings from "../components/settings/SortingSettings.jsx";
import DangerZone from "../components/settings/DangerZone.jsx";
import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { seedSorting } from "../services/sorting.seed.js";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    return { sorting: [] };
  }

  await seedSorting(session.shop);

  const sorting = await prisma.sorting.findMany({
    where: { storeId: store.id },
    orderBy: { position: "asc" },
  });

  return { store, sorting };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const body = await request.json();

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    return { success: false, error: "Store not found" };
  }

  await seedSorting(session.shop);

  const sortOrder = Array.isArray(body?.sortOrder) ? body.sortOrder : [];
  const sortOptionsEnabled = body?.sortOptionsEnabled ?? {};
  const defaultSort =
    typeof body?.defaultSort === "string" ? body.defaultSort : sortOrder[0];

  if (sortOrder.length === 0) {
    return { success: false, error: "Invalid sorting payload" };
  }

  const orderedSorts = [
    defaultSort,
    ...sortOrder.filter((sortId) => sortId !== defaultSort),
  ];

  await prisma.$transaction(
    orderedSorts.map((sortId, index) =>
      prisma.sorting.updateMany({
        where: {
          storeId: store.id,
          name: sortId,
        },
        data: {
          position: index + 1,
          isActive: Boolean(sortOptionsEnabled[sortId]),
        },
      }),
    ),
  );

  return { success: true };
};

export default function Settings() {
  const { sorting, store } = useLoaderData();
  const [diversity, setDiversity] = useState(store.diversity);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetcher = useFetcher();

  const handleSaveSorting = (state) => {
    fetcher.submit(JSON.stringify(state), {
      method: "post",
      encType: "application/json",
    });
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      await fetch("/api/diversity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diversity }),
      });
    } catch (error) {
      console.log(`Error is: ${error}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Page title="Settings" fullWidth>
      <BlockStack gap="400">
        <ProductSetting />
        <FilterSettings />

        <SortingSettings
          initialState={sorting}
          onSave={handleSaveSorting}
          loading={fetcher.state === "submitting"}
        />

        {/* Diversity control */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingSm" as="h3">
              Diversity Control
            </Text>

            <Text as="p" tone="subdued">
              Control how varied the AI output is. Lower values make results
              more consistent, higher values increase variation.
            </Text>

            <TextField
              label="Diversity Weight (0 to 1)"
              type="number"
              value={diversity}
              onChange={(value) => setDiversity(parseFloat(value))}
              autoComplete="off"
              min={0}
              max={1}
              step={0.1}
              helpText="0 = Consistent, 1 = Highly diverse"
            />
            <Button
              variant="primary"
              loading={saveLoading}
              onClick={() => handleSave()}
            >
              Save Diversity
            </Button>
          </BlockStack>
        </Card>

        <DangerZone />
      </BlockStack>
    </Page>
  );
}
