import React from "react";
import { Card, Text, BlockStack, InlineStack, Icon, Button, Box } from "@shopify/polaris";
import { AlertCircleIcon, SearchIcon, ViewIcon } from "@shopify/polaris-icons";

const insights = [
  {
    icon: SearchIcon,
    title: "Missing products for popular query",
    description: "Users search for 'red shoes' frequently but only 2 products match. Consider adding more inventory or synonyms.",
    action: "Add Synonyms",
  },
  {
    icon: ViewIcon,
    title: "High impressions, low clicks",
    description: "\"Wireless Charging Pad\" has 4,100 impressions but only 4% CTR. Review product image and title.",
    action: "Review Product",
  },
  {
    icon: AlertCircleIcon,
    title: "Enable Size filter",
    description: "68% of apparel searches include size terms. Enabling the Size filter could improve conversion by ~12%.",
    action: "Enable Filter",
  },
  {
    icon: SearchIcon,
    title: "Trending query opportunity",
    description: "\"eco-friendly\" searches increased 340% this month. Consider creating a curated collection.",
    action: "Create Collection",
  },
];

const SmartInsights = () => (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Smart Insights</Text>
    <InlineStack gap="400" wrap>
      {insights.map((insight, i) => (
        <div key={i} style={{ flex: "1 1 280px", minWidth: 280 }}>
          <Card>
            <BlockStack gap="300">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={insight.icon} tone="info" />
                <Text variant="headingSm" as="h3">{insight.title}</Text>
              </InlineStack>
              <Text variant="bodySm" as="p" tone="subdued">{insight.description}</Text>
              <Button size="slim" onClick={() => {}}>{insight.action}</Button>
            </BlockStack>
          </Card>
        </div>
      ))}
    </InlineStack>
  </BlockStack>
);

export default SmartInsights;
