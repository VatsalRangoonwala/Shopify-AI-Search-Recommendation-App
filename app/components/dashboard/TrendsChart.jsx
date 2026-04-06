import React from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Select,
} from "@shopify/polaris";

const TrendsChart = ({ data = [], onFilterChange, selectedPeriod, isLoading }) => {
  const options = [
    { label: "Last 24 Hours", value: "day" },
    { label: "Last 7 Days", value: "week" },
    { label: "Last 30 Days", value: "month" },
    { label: "Last Year", value: "year" },
  ];

  const maxValue = data.length > 0 
    ? Math.max(...data.map((d) => d.searches || 0)) 
    : 100;

  const currentPeriodLabel = options.find((o) => o.value === selectedPeriod)?.label || "Last 7 Days";

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingMd" as="h2">Trends</Text>
        <Box width="200px">
          <Select
            label="Date range"
            labelHidden
            options={options}
            onChange={onFilterChange}
            value={selectedPeriod}
            disabled={isLoading}
          />
        </Box>
      </InlineStack>

      <InlineStack gap="400" wrap>
        {/* Searches Card */}
        <div style={{ flex: "1 1 300px" }}>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">
                Searches ({currentPeriodLabel})
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 120,
                  opacity: isLoading ? 0.5 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {data.map((d, i) => (
                  <div key={`search-${i}`} style={{ flex: 1, textAlign: "center" }}>
                    <div
                      style={{
                        height: `${((d.searches || 0) / maxValue) * 100}%`,
                        background: "var(--p-color-bg-fill-brand)",
                        borderRadius: 4,
                        minHeight: 4,
                        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    <Text variant="bodySm" as="p" tone="subdued">{d.label}</Text>
                  </div>
                ))}
              </div>
            </BlockStack>
          </Card>
        </div>

        {/* CTR Card */}
        <div style={{ flex: "1 1 300px" }}>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">CTR Trend (%)</Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 120,
                  opacity: isLoading ? 0.5 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {data.map((d, i) => {
                  const ctr = d.views > 0 ? (d.clicks / d.views) * 100 : 0;
                  return (
                    <div key={`ctr-${i}`} style={{ flex: 1, textAlign: "center" }}>
                      <div
                        style={{
                          height: `${Math.min(ctr * 2, 100)}%`, // Scaled for visibility
                          background: "var(--p-color-bg-fill-success)",
                          borderRadius: 4,
                          minHeight: 4,
                          transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <Text variant="bodySm" as="p" tone="subdued">{d.label}</Text>
                    </div>
                  );
                })}
              </div>
            </BlockStack>
          </Card>
        </div>
      </InlineStack>
    </BlockStack>
  );
};

export default TrendsChart;