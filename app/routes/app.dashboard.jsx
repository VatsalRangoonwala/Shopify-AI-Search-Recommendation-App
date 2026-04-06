import React, { useState } from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Icon, Box } from "@shopify/polaris";
import { useFetcher, useLoaderData } from "react-router";
import KPISection from "../components/dashboard/KPISection.jsx";
import SearchInsights from "../components/dashboard/SearchInsights.jsx";
import RecommendationPerformance from "../components/dashboard/RecommendationPerformance.jsx";
import FilterAnalytics from "../components/dashboard/FilterAnalytics.jsx";
import TrendsChart from "../components/dashboard/TrendsChart.jsx";
import { authenticate } from "../shopify.server.js";
import { getTrendsData } from "../services/trends.service.js";
import { getAnalytics } from "../services/analytics.service.js";


export const loader = async ({ request }) => {

  const { session } = await authenticate.admin(request);

  const initialData = await getAnalytics(session.shop); 
  const initialTrends = await getTrendsData(session.shop, "week");

  return { 
    performance: { ...initialData, trends: initialTrends } 
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
//   const stats = [
//   {
//     title: "Searches",
//     value: data?.searches || 0,
//     change: "+14.2%",
//     trend: "positive",
//     description: "Total searches this month",
//     icon: SearchIcon,
//   },
//   {
//     title: "Recommendation Clicks",
//     value: data?.clicks || 0,
//     change: "+8.7%",
//     trend: "positive",
//     description: "Clicks on AI recommendations",
//     icon: TargetIcon,
//   },
//   {
//     title: "Conversion Boost",
//     value: data?.conversionRate || 0,
//     change: "+3.1%",
//     trend: "positive",
//     description: "Increase from AI-powered features",
//     icon: ChartVerticalFilledIcon,
//   },
// ];

  return (
  <Page title="Dashboard">
    <BlockStack gap="600">
      <KPISection data={performance}/>
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
