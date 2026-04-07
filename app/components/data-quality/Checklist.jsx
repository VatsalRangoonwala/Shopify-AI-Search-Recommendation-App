import React from "react";
import { BlockStack, Text, InlineStack, Icon, Tooltip, Box } from "@shopify/polaris";
import { QuestionCircleIcon, CheckCircleIcon , MinusCircleIcon} from "@shopify/polaris-icons";

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
    {ITEMS.map((item) => {
      const isDone = checked[item.id];
      
      return (
        <div
          key={item.id}
          onClick={() => onToggle(item.id)}
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            border: "1px solid var(--p-color-border-subdued)",
            background: isDone 
              ? "var(--p-color-bg-surface-success)" 
              : "var(--p-color-bg-surface)",
            transition: "all 0.2s ease",
          }}
          // Simple hover effect using standard CSS logic
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--p-color-border-brand)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--p-color-border-subdued)"}
        >
          <InlineStack align="space-between" blockAlign="center" gap="400">
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              {/* Replacing Checkbox with a Status Icon */}
              <Icon 
                source={isDone ? CheckCircleIcon :  MinusCircleIcon} 
                tone={isDone ? "success" : "subdued"} 
              />
              
              <BlockStack gap="050">
                <Text 
                  variant="bodyMd" 
                  as="span" 
                  fontWeight="semibold"
                  // Optional: strike-through text if checked
                  style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}
                >
                  {item.label}
                </Text>
                <Text variant="bodySm" as="span" tone="subdued">
                  {item.helper}
                </Text>
              </BlockStack>
            </InlineStack>

            <Tooltip content={item.tip} dismissOnMouseOut>
              <Box padding="100">
                <Icon source={QuestionCircleIcon} tone="subdued" />
              </Box>
            </Tooltip>
          </InlineStack>
        </div>
      );
    })}
  </BlockStack>
);

export default Checklist;