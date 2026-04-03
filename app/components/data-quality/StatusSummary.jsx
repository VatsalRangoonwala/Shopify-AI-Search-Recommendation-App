import React from "react";
import { BlockStack, Card, Text, InlineStack, Icon, Badge } from "@shopify/polaris";
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from "@shopify/polaris-icons";

const STATUS = [
  { label: "Product Titles", status: "success", message: "Looking good", icon: CheckCircleIcon, tone: "success" },
  { label: "Descriptions", status: "warning", message: "Missing for 40% of products", icon: AlertTriangleIcon, tone: "warning" },
  { label: "Tags", status: "critical", message: "Not detected on most products", icon: XCircleIcon, tone: "critical" },
  { label: "Price & Stock", status: "success", message: "Up to date", icon: CheckCircleIcon, tone: "success" },
  { label: "User Interactions", status: "warning", message: "Limited data available", icon: AlertTriangleIcon, tone: "warning" },
];

const StatusSummary = () => (
  <Card>
    <BlockStack gap="400">
      <Text variant="headingSm" as="h3">
        Store Data Diagnostic
      </Text>
      {STATUS.map((item) => (
        <InlineStack key={item.label} align="space-between" blockAlign="center" gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={item.icon} tone={item.tone} />
            <Text variant="bodyMd" as="span" fontWeight="semibold">
              {item.label}
            </Text>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            <Text variant="bodySm" as="span" tone="subdued">
              {item.message}
            </Text>
            <Badge tone={item.tone}>{item.status === "success" ? "Good" : item.status === "warning" ? "Needs Work" : "Action Required"}</Badge>
          </InlineStack>
        </InlineStack>
      ))}
    </BlockStack>
  </Card>
);

export default StatusSummary;
