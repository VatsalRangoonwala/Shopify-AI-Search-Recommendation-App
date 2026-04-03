import React from "react";
import { BlockStack, Card, Text, InlineStack, ProgressBar, Badge } from "@shopify/polaris";

const WEIGHTS = [
  {
    label: "Purchase",
    weight: 5.0,
    pct: 100,
    tone: "success",
    badge: "Strongest signal",
    desc: "Clearest indicator of intent",
  },
  {
    label: "Add to Cart",
    weight: 3.0,
    pct: 60,
    tone: "warning",
    badge: "High intent",
    desc: "Strong interest or active consideration",
  },
  {
    label: "View",
    weight: 1.0,
    pct: 20,
    tone: "info",
    badge: "General interest",
    desc: "Passive engagement signal",
  },
];

const WeightModel = () => (
  <Card>
    <BlockStack gap="400">
      <BlockStack gap="100">
        <Text variant="headingSm" as="h3">
          User Interactions: The Engine of Personalization
        </Text>
        <Text variant="bodySm" as="p" tone="subdued">
          The AI learns customer preferences by analyzing behavior using a
          weighted model. As more interactions are tracked, the{" "}
          <Text as="span" fontWeight="semibold">
            User Interest Vector
          </Text>{" "}
          evolves to reflect individual preferences more accurately.
        </Text>
      </BlockStack>

      {WEIGHTS.map((item) => (
        <BlockStack key={item.label} gap="150">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="bodyMd" as="span" fontWeight="semibold">
                {item.label}
              </Text>
              <Badge tone={item.tone}>{item.badge}</Badge>
            </InlineStack>
            <Text variant="bodyMd" as="span" fontWeight="semibold">
              {item.weight.toFixed(1)}×
            </Text>
          </InlineStack>
          <ProgressBar progress={item.pct} tone={item.tone} size="small" />
          <Text variant="bodySm" as="span" tone="subdued">
            {item.desc}
          </Text>
        </BlockStack>
      ))}
    </BlockStack>
  </Card>
);

export default WeightModel;