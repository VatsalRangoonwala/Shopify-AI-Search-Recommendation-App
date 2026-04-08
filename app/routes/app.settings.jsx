import { Page, BlockStack } from "@shopify/polaris";
import { useFetcher, useLoaderData } from "react-router";
import FilterSettings from "../components/settings/FilterSettings.jsx";
import SortingSettings from "../components/settings/SortingSettings.jsx";
import DangerZone from "../components/settings/DangerZone.jsx";
import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { seedSorting } from "../services/sorting.seed.js";

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

  return { sorting };
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
  const { sorting } = useLoaderData();
  const fetcher = useFetcher();

  const handleSaveSorting = (state) => {
    fetcher.submit(JSON.stringify(state), {
      method: "post",
      encType: "application/json",
    });
  };

  return (
    <Page title="Settings" fullWidth>
      <BlockStack gap="400">
        <FilterSettings />

        <SortingSettings
          initialState={sorting}
          onSave={handleSaveSorting}
          loading={fetcher.state === "submitting"}
        />

        <DangerZone />
      </BlockStack>
    </Page>
  );
}
