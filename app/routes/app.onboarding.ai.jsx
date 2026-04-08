import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, Text, BlockStack, Button, Box, InlineStack, Divider } from "@shopify/polaris";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";
import { requireOnboarding } from "../utils/onboarding-guard.js";

export const loader = async ({ request }) => {
  await requireOnboarding(request);
  return null;
};

const initialFeatures = [
  {
    id: "recommendations",
    title: "AI Recommendations",
    description: "Show personalized product recommendations based on browsing behavior and purchase history.",
    enabled: true,
  },
  {
    id: "intent-search",
    title: "Intent Search",
    description: "Understand natural language queries and match customers with the right products, even with typos.",
    enabled: false,
  },
];

const AiToggle = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState(initialFeatures);

  const toggleFeature = (id) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <OnboardingLayout currentStep={7}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              AI Features
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Enable AI-powered features for your store.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="400">
            {features.map((feature) => (
              <Box
                key={feature.id}
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <InlineStack align="space-between" blockAlign="start" wrap={false}>
                  <BlockStack gap="100">
                    <Text variant="headingSm" as="h3">
                      {feature.title}
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      {feature.description}
                    </Text>
                  </BlockStack>
                  <Box minWidth="60px">
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        border: "none",
                        cursor: "pointer",
                        background: feature.enabled ? "#008060" : "#c4cdd5",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#fff",
                          position: "absolute",
                          top: 3,
                          left: feature.enabled ? 23 : 3,
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </Box>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>

          <Box paddingBlockStart="200">
            <Button variant="primary" onClick={() => navigate("/app/onboarding/complete")}>
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default AiToggle;
