import React from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Icon, Box } from "@shopify/polaris";
import { SearchIcon, TargetIcon, ChartVerticalFilledIcon } from "@shopify/polaris-icons";
import { useLoaderData } from "react-router";
import KPISection from "../components/dashboard/KPISection.jsx";
import AlertsSection from "../components/dashboard/AlertsSection.jsx";
import SearchInsights from "../components/dashboard/SearchInsights.jsx";
import RecommendationPerformance from "../components/dashboard/RecommendationPerformance.jsx";
import FilterAnalytics from "../components/dashboard/FilterAnalytics.jsx";
import TrendsChart from "../components/dashboard/TrendsChart.jsx";
import SmartInsights from "../components/dashboard/SmartInsights.jsx";
import QuickActions from "../components/dashboard/QuickActions.jsx";

// export const loader = async ({ request }) => {
//   const res = await fetch(`${process.env.APP_URL}/api/analytics`, {
//     headers: request.headers,
//   });
//   const data = await res.json()
//   return data;
// };


const Dashboard = () => {
  // const data = useLoaderData();

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
      <KPISection />
      <AlertsSection />
      <SearchInsights />
      <RecommendationPerformance />
      <FilterAnalytics />
      <TrendsChart />
      <SmartInsights />
      <QuickActions />
    </BlockStack>
  </Page>
);
};

export default Dashboard;
