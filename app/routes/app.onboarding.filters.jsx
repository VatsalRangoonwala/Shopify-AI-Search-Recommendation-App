import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, Text, BlockStack, Button, Checkbox, InlineStack, Divider, Box } from "@shopify/polaris";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";

const initialFilters = [
  { id: "color", label: "Color", description: "Filter products by color options", enabled: true, checked: true },
  { id: "size", label: "Size", description: "Filter products by size variants", enabled: true, checked: true },
  { id: "price", label: "Price Range", description: "Filter products by price brackets", enabled: false, checked: false },
  { id: "brand", label: "Brand", description: "Filter products by brand name", enabled: false, checked: false },
  { id: "material", label: "Material", description: "Filter products by material type", enabled: false, checked: false },
];

const Filters = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);

  const toggleFilter = (id) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked: !f.checked, enabled: !f.enabled } : f))
    );
  };

  return (
    <OnboardingLayout currentStep={3}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              Configure Filters
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Choose which filters to enable for your storefront search experience.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="400">
            {filters.map((filter) => (
              <Box key={filter.id} padding="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Checkbox
                    label={filter.label}
                    helpText={filter.description}
                    checked={filter.checked}
                    onChange={() => toggleFilter(filter.id)}
                  />
                </InlineStack>
              </Box>
            ))}
          </BlockStack>

          <Box paddingBlockStart="200">
            <Button variant="primary" onClick={() => navigate("/app/onboarding/sorting")}>
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Filters;
