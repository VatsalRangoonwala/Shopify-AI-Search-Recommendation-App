import React from "react";
import { Card, Text, BlockStack, InlineStack, Box } from "@shopify/polaris";

const searchData = [
  { label: "Mon", value: 320 },
  { label: "Tue", value: 480 },
  { label: "Wed", value: 420 },
  { label: "Thu", value: 560 },
  { label: "Fri", value: 610 },
  { label: "Sat", value: 750 },
  { label: "Sun", value: 690 },
];

const maxValue = Math.max(...searchData.map((d) => d.value));

const TrendsChart = () => (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Trends</Text>
    <InlineStack gap="400" wrap>
      <div style={{ flex: "1 1 300px" }}>
        <Card>
          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">Searches (Last 7 Days)</Text>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {searchData.map((d) => (
                <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: `${(d.value / maxValue) * 100}px`,
                      background: "var(--p-color-bg-fill-brand)",
                      borderRadius: 4,
                      minHeight: 4,
                    }}
                  />
                  <Text variant="bodySm" as="p" tone="subdued">{d.label}</Text>
                </div>
              ))}
            </div>
          </BlockStack>
        </Card>
      </div>
      <div style={{ flex: "1 1 300px" }}>
        <Card>
          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">CTR Trend (Last 7 Days)</Text>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {[8.2, 9.1, 11.4, 10.8, 12.3, 14.1, 12.0].map((val, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: `${(val / 15) * 100}px`,
                      background: "var(--p-color-bg-fill-success)",
                      borderRadius: 4,
                      minHeight: 4,
                    }}
                  />
                  <Text variant="bodySm" as="p" tone="subdued">{searchData[i].label}</Text>
                </div>
              ))}
            </div>
          </BlockStack>
        </Card>
      </div>
    </InlineStack>
  </BlockStack>
);

export default TrendsChart;
