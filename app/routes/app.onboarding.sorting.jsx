import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card, Text, BlockStack, Button, InlineStack, Box, Divider, RadioButton, Icon,
} from "@shopify/polaris";
import { DragHandleIcon } from "@shopify/polaris-icons";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";

const initialOptions = [
  { id: "relevance", label: "Relevance", enabled: true },
  { id: "price-asc", label: "Price: Low to High", enabled: true },
  { id: "price-desc", label: "Price: High to Low", enabled: true },
  { id: "newest", label: "Newest First", enabled: true },
  { id: "bestselling", label: "Best Selling", enabled: false },
];

const Sorting = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState(initialOptions);
  const [defaultOption, setDefaultOption] = useState("relevance");

  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o))
    );
  };

  return (
    <OnboardingLayout currentStep={4}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              Sorting Options
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Configure how customers can sort search results. Drag to reorder priority.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="200">
            {options.map((option) => (
              <Box
                key={option.id}
                padding="300"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <InlineStack align="space-between" blockAlign="center" wrap={false}>
                  <InlineStack gap="300" blockAlign="center" wrap={false}>
                    <div style={{ cursor: "grab", color: "#8c9196" }}>
                      <Icon source={DragHandleIcon} tone="subdued" />
                    </div>
                    <Text variant="bodyMd" as="span">
                      {option.label}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="400" blockAlign="center">
                    <RadioButton
                      label="Default"
                      labelHidden
                      checked={defaultOption === option.id}
                      onChange={() => setDefaultOption(option.id)}
                      name="defaultSort"
                    />
                    <Button
                      variant="plain"
                      onClick={() => toggleOption(option.id)}
                    >
                      {option.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </InlineStack>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>

          <Text variant="bodySm" as="p" tone="subdued">
            Select the radio button to set the default sorting option. Toggle to enable/disable.
          </Text>

          <Box paddingBlockStart="200">
            <Button variant="primary" onClick={() => navigate("/app/onboarding/storefront")}>
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Sorting;
