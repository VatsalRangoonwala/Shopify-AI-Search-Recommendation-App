import React, { useEffect } from "react";
import { Card, DataTable, Text, BlockStack, Badge } from "@shopify/polaris";
import { useFetcher } from "react-router";

// const products = [
//   { name: "Classic White Sneakers", impressions: 3240, clicks: 486, ctr: "15.0%" },
//   { name: "Organic Cotton Tee", impressions: 2810, clicks: 365, ctr: "13.0%" },
//   { name: "Leather Crossbody Bag", impressions: 1950, clicks: 410, ctr: "21.0%" },
//   { name: "Wireless Charging Pad", impressions: 4100, clicks: 164, ctr: "4.0%" },
//   { name: "Bamboo Water Bottle", impressions: 1620, clicks: 308, ctr: "19.0%" },
//   { name: "Minimalist Watch", impressions: 2200, clicks: 66, ctr: "3.0%" },
// ];

const RecommendationPerformance = () => {
  const fetcher = useFetcher();

useEffect(() => {
  fetcher.load("/api/recommendation-performance");
}, []);

const products = fetcher.data || [];
  const rows = products.map((p) => {
  const ctrNum = parseFloat(p.ctr);

  const badge =
    p.performance === "high" ? (
      <Badge tone="success">High</Badge>
    ) : p.performance === "low" ? (
      <Badge tone="critical">Low</Badge>
    ) : (
      <Badge>Average</Badge>
    );

  return [
    p.name,
    p.impressions.toLocaleString(),
    p.clicks.toLocaleString(),
    p.ctr,
    badge,
  ];
});
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Recommendation Performance</Text>
      <Card>
        <DataTable
          columnContentTypes={["text", "numeric", "numeric", "text", "text"]}
          headings={["Product", "Impressions", "Clicks", "CTR", "Performance"]}
          rows={rows}
          hoverable
        />
      </Card>
    </BlockStack>
  );
};

export default RecommendationPerformance;
