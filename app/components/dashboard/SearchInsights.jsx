import React from "react";
import { Card, DataTable, Text, BlockStack, Badge } from "@shopify/polaris";

const queries = [
  { query: "red shoes", results: 24, clickRate: "18.3%", status: "ok" },
  { query: "black hoodie", results: 56, clickRate: "14.1%", status: "ok" },
  { query: "vintage lamp", results: 0, clickRate: "0%", status: "no-results" },
  { query: "wireless earbuds", results: 12, clickRate: "22.5%", status: "ok" },
  { query: "eco bag", results: 0, clickRate: "0%", status: "no-results" },
  { query: "running shorts", results: 38, clickRate: "11.2%", status: "ok" },
  { query: "gold necklace", results: 8, clickRate: "25.0%", status: "ok" },
  { query: "yoga mat organic", results: 0, clickRate: "0%", status: "no-results" },
];

const SearchInsights = () => {
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
      <Text variant="headingMd" as="h2">Search Insights</Text>
      <Card>
        <DataTable
          columnContentTypes={["text", "numeric", "text", "text"]}
          headings={["Query", "Results", "Click Rate", "Status"]}
          rows={rows}
          hoverable
        />
      </Card>
    </BlockStack>
  );
};

export default SearchInsights;
