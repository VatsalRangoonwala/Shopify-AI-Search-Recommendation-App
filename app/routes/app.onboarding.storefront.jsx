import React from "react";
import { useNavigate } from "react-router";
import { Card, Text, BlockStack, Button, Box, InlineStack, Divider, List, Banner } from "@shopify/polaris";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";

const Storefront = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout currentStep={5}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              Storefront Integration
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Add AI-powered search to your store's theme.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">
              Setup Instructions
            </Text>
            <List type="number">
              <List.Item>Open your Shopify Theme Editor</List.Item>
              <List.Item>Navigate to the search page template</List.Item>
              <List.Item>Add the "AI Search" app block</List.Item>
              <List.Item>Position and save your changes</List.Item>
            </List>
          </BlockStack>

          <Button variant="primary" onClick={() => {}}>
            Customize Theme
          </Button>

          <Box
            padding="800"
            background="bg-surface-secondary"
            borderRadius="300"
          >
            <BlockStack gap="300" inlineAlign="center">
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: 200,
                  background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #c4cdd5",
                }}
              >
                <Text variant="bodyMd" as="p" tone="subdued">
                  Theme Preview Placeholder
                </Text>
              </div>
            </BlockStack>
          </Box>

          <Box paddingBlockStart="200">
            <Button variant="primary" onClick={() => navigate("/app/onboarding/ai")}>
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Storefront;
