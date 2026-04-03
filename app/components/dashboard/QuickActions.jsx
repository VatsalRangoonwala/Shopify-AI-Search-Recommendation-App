import React from "react";
import { Card, Text, BlockStack, InlineStack, Button } from "@shopify/polaris";

const actions = [
  { label: "Re-sync Products", variant: "primary" },
  { label: "Configure Filters" },
  { label: "Configure Sorting" },
  { label: "Adjust AI Settings" },
];

const QuickActions = () => (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Quick Actions</Text>
    <Card>
      <InlineStack gap="300" wrap>
        {actions.map((a) => (
          <Button key={a.label} variant={a.variant} onClick={() => {}}>
            {a.label}
          </Button>
        ))}
      </InlineStack>
    </Card>
  </BlockStack>
);

export default QuickActions;
