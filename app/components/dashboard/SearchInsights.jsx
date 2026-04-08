import React, { useEffect } from "react";
import {
  Card,
  DataTable,
  Text,
  BlockStack,
  Badge,
  SkeletonBodyText,
  Box,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { useFetcher } from "react-router";

const SearchInsights = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/search-insights");
  }, []);

  const isLoading = fetcher.state === "loading" || !fetcher.data;
  const queries = fetcher.data || [];

  const rows = queries.map((q) => [
    q.query,
    q.results,
    q.clickRate,
    q.status === "ok" ? (
      <Badge tone="success">OK</Badge>
    ) : (
      <Badge tone="critical">No Results</Badge>
    ),
  ]);

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Search Insights
      </Text>
      <Card>
        {isLoading ? (
          /* Skeleton Loader State */
          <Box padding="400">
            <BlockStack gap="400">
              {/* Table Header Placeholder */}
              <Box width="100%">
                <SkeletonDisplayText size="small" />
              </Box>
              <div
                style={{
                  borderTop: "1px solid var(--p-color-border-subdued)",
                  paddingTop: "16px",
                }}
              >
                <BlockStack gap="500">
                  <SkeletonBodyText lines={5} />
                </BlockStack>
              </div>
            </BlockStack>
          </Box>
        ) : (
          /* Actual Data State */
          <DataTable
            columnContentTypes={["text", "numeric", "text", "text"]}
            headings={["Query", "Results", "Click Rate", "Status"]}
            rows={rows}
            hoverable
          />
        )}
      </Card>
    </BlockStack>
  );
};

export default SearchInsights;