import React, { useEffect } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Tag,
  ProgressBar,
  Box,
} from "@shopify/polaris";
import { useFetcher } from "react-router";

// const filters = [
//   { name: "Color", usage: 4520, percentage: 85, dropoff: "12%" },
//   { name: "Size", usage: 3890, percentage: 73, dropoff: "18%" },
//   { name: "Price Range", usage: 3210, percentage: 60, dropoff: "8%" },
//   { name: "Brand", usage: 1840, percentage: 35, dropoff: "22%" },
//   { name: "Material", usage: 920, percentage: 17, dropoff: "31%" },
// ];

const FilterAnalytics = () => {
  const fetcher = useFetcher();

useEffect(() => {
  fetcher.load("/api/filter-analytics");
}, []);

const filters = fetcher.data || [];
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Filter Usage Analytics
      </Text>
      <Card>
        <BlockStack gap="400">
          {filters.map((f) => (
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
          ))}
        </BlockStack>
      </Card>
    </BlockStack>
  );
};

export default FilterAnalytics;
