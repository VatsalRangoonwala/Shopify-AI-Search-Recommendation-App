import React, { useState } from "react";
import {
  BlockStack,
  Card,
  Text,
  InlineStack,
  Icon,
  Collapsible,
  Button,
  Badge,
  Divider,
} from "@shopify/polaris";
import {
  AlertTriangleIcon,
  AlertDiamondIcon,
} from "@shopify/polaris-icons";

const ISSUES = [
  {
    id: "thin_content",
    label: 'A. The "Thin Content" Trap',
    icon: AlertDiamondIcon,
    tone: "critical",
    badge: "Most Common",
    badgeTone: "critical",
    cause: 'Titles are vague (e.g., "SKU-9921") and descriptions are missing.',
    effect:
      "The AI lacks meaningful context and returns broad or random matches.",
    fix: "Add clear descriptive titles and at least 2–3 sentence descriptions to every product.",
  },
  {
    id: "cold_start",
    label: 'B. The "Cold Start" Problem',
    icon: AlertTriangleIcon,
    tone: "warning",
    badge: "New Stores",
    badgeTone: "warning",
    cause: "New store or new product with no interaction data.",
    effect:
      "Recommendations remain generic until user activity is recorded.",
    fix: "Encourage early visitors to browse and interact. Even a few dozen views improve results.",
  },
  {
    id: "narrow_catalog",
    label: 'C. The "Narrow Catalog" Cluster',
    icon: AlertTriangleIcon,
    tone: "warning",
    badge: "Small Catalogs",
    badgeTone: "warning",
    cause: "Very limited or highly similar product range.",
    effect:
      "Difficulty generating diverse recommendations — MMR diversity helps, but requires variety.",
    fix: "Expand your catalog or use rich tags to surface subtle differences between similar products.",
  },
  {
    id: "stale",
    label: "D. Stale Data",
    icon: AlertDiamondIcon,
    tone: "critical",
    badge: "Silent Killer",
    badgeTone: "critical",
    cause: "Outdated product metadata (price, stock, etc.).",
    effect:
      "Inaccurate recommendations — wrong price ranges or unavailable items surface to customers.",
    fix: "Sync inventory and pricing in real time, or at minimum daily.",
  },
];

const IssueRow = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <BlockStack gap="0">
      <div
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <InlineStack align="space-between" blockAlign="center" gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={item.icon} tone={item.tone} />
            <Text variant="bodyMd" as="span" fontWeight="semibold">
              {item.label}
            </Text>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            <Badge tone={item.badgeTone}>{item.badge}</Badge>
            <Button
              variant="plain"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              disclosure={open ? "up" : "down"}
            />
          </InlineStack>
        </InlineStack>
      </div>

      <Collapsible open={open} id={item.id}>
        <div style={{ paddingTop: "12px", paddingLeft: "28px" }}>
          <BlockStack gap="200">
            <InlineStack gap="100" blockAlign="start">
              <Text variant="bodySm" as="span" tone="subdued" fontWeight="semibold">
                Cause:
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                {item.cause}
              </Text>
            </InlineStack>
            <InlineStack gap="100" blockAlign="start">
              <Text variant="bodySm" as="span" tone="subdued" fontWeight="semibold">
                Effect:
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                {item.effect}
              </Text>
            </InlineStack>
            <InlineStack gap="100" blockAlign="start">
              <Text variant="bodySm" as="span" tone="success" fontWeight="semibold">
                Fix:
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                {item.fix}
              </Text>
            </InlineStack>
          </BlockStack>
        </div>
      </Collapsible>
    </BlockStack>
  );
};

const DataIssues = () => (
  <Card>
    <BlockStack gap="400">
      <BlockStack gap="100">
        <Text variant="headingSm" as="h3">
          Why You Might Get "Bad" Recommendations
        </Text>
        <Text variant="bodySm" as="p" tone="subdued">
          If recommendations appear irrelevant or repetitive, it's usually one
          of these data issues. Tap each to see the cause, effect, and fix.
        </Text>
      </BlockStack>

      {ISSUES.map((item, i) => (
        <BlockStack key={item.id} gap="400">
          <IssueRow item={item} />
          {i < ISSUES.length - 1 && <Divider />}
        </BlockStack>
      ))}
    </BlockStack>
  </Card>
);

export default DataIssues;