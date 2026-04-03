import React from "react";
import { BlockStack, Checkbox, Text, InlineStack, Icon, Tooltip } from "@shopify/polaris";
import { QuestionCircleIcon } from "@shopify/polaris-icons";

const ITEMS = [
  {
    id: "titles",
    label: "Use clear, descriptive product titles",
    helper: "Include key details like brand, type, and color in titles.",
    tip: "Example: 'Nike Air Max 90 – Black/White' instead of 'Shoes'",
  },
  {
    id: "descriptions",
    label: "Add detailed descriptions (2–3 sentences)",
    helper: "Describe the product's features, materials, and use case.",
    tip: "AI uses descriptions to understand what makes each product unique.",
  },
  {
    id: "tags",
    label: "Include relevant tags (color, style, use-case)",
    helper: "Tags help AI categorize and match products to searches.",
    tip: "Use consistent tags like 'casual', 'summer', 'cotton' across products.",
  },
  {
    id: "price_stock",
    label: "Ensure price & stock are up to date",
    helper: "Outdated inventory leads to poor customer experiences.",
    tip: "AI deprioritizes out-of-stock items in recommendations.",
  },
  {
    id: "interactions",
    label: "Track user interactions (views, cart, purchase)",
    helper: "Behavioral data powers personalized recommendations.",
    tip: "The more interaction data, the smarter your recommendations become.",
  },
];

const Checklist = ({ checked, onToggle }) => (
  <BlockStack gap="400">
    {ITEMS.map((item) => (
      <div
        key={item.id}
        style={{
          padding: "12px 16px",
          borderRadius: "8px",
          background: checked[item.id] ? "var(--p-color-bg-surface-success)" : "var(--p-color-bg-surface-secondary)",
          transition: "background 0.2s",
        }}
      >
        <InlineStack align="space-between" blockAlign="start" gap="200">
          <InlineStack gap="200" blockAlign="start" wrap={false}>
            <Checkbox
              label=""
              checked={checked[item.id] || false}
              onChange={() => onToggle(item.id)}
              labelHidden
            />
            <BlockStack gap="100">
              <Text variant="bodyMd" as="span" fontWeight="semibold">
                {item.label}
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                {item.helper}
              </Text>
            </BlockStack>
          </InlineStack>
          <Tooltip content={item.tip}>
            <Icon source={QuestionCircleIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
      </div>
    ))}
  </BlockStack>
);

export default Checklist;
