import React from "react";
import { useNavigate } from "react-router";
import { Card, Text, BlockStack, Button, InlineStack, Icon, Box, Divider } from "@shopify/polaris";
import { SearchIcon, AutomationIcon, ChartVerticalFilledIcon } from "@shopify/polaris-icons";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";

const features = [
  {
    icon: SearchIcon,
    title: "Sync Your Products",
    description: "We'll import your product catalog and prepare it for AI-powered search.",
  },
  {
    icon: AutomationIcon,
    title: "Configure AI Features",
    description: "Set up smart filters, sorting, and recommendation engines.",
  },
  {
    icon: ChartVerticalFilledIcon,
    title: "Launch & Grow",
    description: "Activate on your storefront and watch conversions climb.",
  },
];

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout currentStep={1}>
      <Card>
        <BlockStack gap="600">
          <BlockStack gap="200">
            <Text variant="heading2xl" as="h1">
              Welcome to AI Search & Discovery
            </Text>
            <Text variant="bodyLg" as="p" tone="subdued">
              Let's get your store set up with intelligent search, smart recommendations,
              and AI-powered product discovery. This takes about 5 minutes.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="500">
            {features.map((feature, index) => (
              <InlineStack key={index} gap="400" blockAlign="start" wrap={false}>
                <Box
                  background="bg-fill-info-secondary"
                  borderRadius="200"
                  padding="300"
                >
                  <Icon source={feature.icon} tone="info" />
                </Box>
                <BlockStack gap="100">
                  <Text variant="headingSm" as="h3">
                    {feature.title}
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    {feature.description}
                  </Text>
                </BlockStack>
              </InlineStack>
            ))}
          </BlockStack>

          <Box paddingBlockStart="400">
            <Button variant="primary" size="large" onClick={() => navigate("/app/onboarding/sync")}>
              Start Setup
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Welcome;
