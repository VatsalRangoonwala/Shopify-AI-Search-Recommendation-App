import { useState } from "react";
import { Page, BlockStack } from "@shopify/polaris";
import { useFetcher, useLoaderData } from "react-router";
import KPISection from "../components/dashboard/KPISection.jsx";
import SearchInsights from "../components/dashboard/SearchInsights.jsx";
import RecommendationPerformance from "../components/dashboard/RecommendationPerformance.jsx";
import FilterAnalytics from "../components/dashboard/FilterAnalytics.jsx";
import TrendsChart from "../components/dashboard/TrendsChart.jsx";
import { authenticate } from "../shopify.server.js";
import { getTrendsData } from "../services/trends.service.js";
import {
  fetchTotalProductsCount,
  getAnalytics,
} from "../services/analytics.service.js";
import prisma from "../db.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: {
      shop: session.shop,
    },
  });

  const initialData = await getAnalytics(store.id);
  const initialTrends = await getTrendsData(store.id, "week");
  const totalProducts = await fetchTotalProductsCount(admin);
  const syncedProducts = await prisma.product.count({
    where: { storeId: store.id },
  });

  return {
    performance: {
      ...initialData,
      trends: initialTrends,
      totalProducts: totalProducts,
      syncedProducts: syncedProducts,
    },
  };
};

const Dashboard = () => {
  const { performance } = useLoaderData();
  const fetcher = useFetcher();
  const [period, setPeriod] = useState("week");

  const currentData = fetcher.data ? fetcher.data : performance;

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetcher.load(`/api/analytics?period=${newPeriod}`);
  };

  return (
    <Page title="Dashboard">
      <BlockStack gap="600">
        <KPISection data={performance} />
        <TrendsChart
          data={currentData.trends}
          selectedPeriod={period}
          onFilterChange={handlePeriodChange}
          isLoading={fetcher.state === "loading"}
        />
        <SearchInsights />
        <RecommendationPerformance />
        <FilterAnalytics />
      </BlockStack>
    </Page>
  );
};

export default Dashboard;
