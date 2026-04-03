import React from "react";
import { Banner, BlockStack, Text, Button } from "@shopify/polaris";

const alerts = [
  {
    title: "High no-result searches detected",
    description: "32 search queries returned zero results in the last 7 days. Review and add missing products or synonyms.",
    status: "critical",
    action: "Fix Now",
  },
  {
    title: "Low recommendation CTR",
    description: "Recommendation click-through rate dropped below 5% for 3 product categories.",
    status: "warning",
    action: "Review",
  },
  {
    title: "Product sync outdated",
    description: "Last sync was 48 hours ago. New products may not appear in search results.",
    status: "warning",
    action: "Re-sync",
  },
];

const AlertsSection = () => (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Alerts & Issues</Text>
    {alerts.map((alert, i) => (
      <Banner
        key={i}
        title={alert.title}
        tone={alert.status}
        action={{ content: alert.action, onAction: () => {} }}
      >
        <p>{alert.description}</p>
      </Banner>
    ))}
  </BlockStack>
);

export default AlertsSection;
