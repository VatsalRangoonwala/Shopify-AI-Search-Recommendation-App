import React, { useEffect } from "react";
import {
  Card,
  DataTable,
  Text,
  BlockStack,
  Badge,
  SkeletonBodyText,
  Box,
} from "@shopify/polaris";
import { useFetcher } from "react-router";

const RecommendationPerformance = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/recommendation-performance");
  }, []);
  const isLoading = fetcher.state === "loading" || !fetcher.data;
  const products = fetcher.data || [];

  const rows = products.map((p) => {
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
      <Text variant="headingMd" as="h2">
        Recommendation Performance
      </Text>
      <Card>
        {isLoading ? (
          /* The Skeleton State */
          <Box padding="400">
            <BlockStack gap="500">
              {/* This mimics the table rows */}
              <SkeletonBodyText lines={1} />
              <div style={{ borderTop: '1px solid var(--p-color-border-subdued)', paddingTop: '16px' }}>
                <SkeletonBodyText lines={5} />
              </div>
            </BlockStack>
          </Box>
        ) : (
          /* The Data State */
          <DataTable
            columnContentTypes={["text", "numeric", "numeric", "text", "text"]}
            headings={["Product", "Impressions", "Clicks", "CTR", "Performance"]}
            rows={rows}
            hoverable
          />
        )}
      </Card>
    </BlockStack>
  );
};

export default RecommendationPerformance;