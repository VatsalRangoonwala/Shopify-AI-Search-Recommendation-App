import React, { useEffect } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Tag,
  ProgressBar,
  Box,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { useFetcher } from "react-router";

const FilterAnalytics = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/filter-analytics");
  }, []);

  // Determine if we are in a loading state
  const isLoading = fetcher.state === "loading" || !fetcher.data;
  const filters = fetcher.data || [];

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Filter Usage Analytics
      </Text>
      <Card>
        <BlockStack gap="400">
          {isLoading ? (
            // Skeleton State: Mimics 3 filter rows
            [1, 2, 3].map((key) => (
              <BlockStack key={key} gap="200">
                <InlineStack align="space-between">
                  <Box width="80px">
                    <SkeletonBodyText lines={1} />
                  </Box>
                  <Box width="60px">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </InlineStack>
                {/* Mimics the ProgressBar */}
                <Box background="bg-surface-secondary" borderRadius="100" minHeight="8px" />
              </BlockStack>
            ))
          ) : (
            // Real Data State
            filters.map((f) => (
              <BlockStack key={f.name} gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Tag>{f.name}</Tag>
                    <Text variant="bodySm" as="span">
                      {f.usage.toLocaleString()} uses
                    </Text>
                  </InlineStack>
                  <Text variant="bodySm" as="span" tone="subdued">
                    Drop-off: {f.dropoff}
                  </Text>
                </InlineStack>
                <ProgressBar
                  progress={f.percentage}
                  size="small"
                  tone="primary"
                />
              </BlockStack>
            ))
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
};

export default FilterAnalytics;