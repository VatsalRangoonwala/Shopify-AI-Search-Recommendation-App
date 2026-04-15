import React from "react";
import { useNavigate } from "react-router";
import { Card, Text, BlockStack, Button, InlineStack, Icon, Box, Divider } from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";
import prisma from "../db.server.js";
import { requireOnboarding } from "../utils/onboarding-guard.js";

export const loader = async ({ request }) => {
  const { session } = await requireOnboarding(request);

  await prisma.store.updateMany({
    where: { shop: session.shop },
    data: { isOnboarding: false },
  });

  return null;
};

const checklist = [
  "Products synced",
  "Filters configured",
  "Sorting options set",
  "Storefront integration ready",
  "AI features enabled",
];

const Complete = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout currentStep={7}>
      <Card>
        <BlockStack gap="600">
          <BlockStack gap="300" inlineAlign="center">
            <div style={{ color: "#008060" }}>
              <Icon source={CheckCircleIcon} tone="success" />
            </div>
            <Text variant="heading2xl" as="h1" alignment="center">
              You're All Set! 🎉
            </Text>
            <Text variant="bodyLg" as="p" tone="subdued" alignment="center">
              Your AI-powered search and discovery is ready to go. Here's what we've configured:
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            {checklist.map((item) => (
              <InlineStack key={item} gap="200" blockAlign="center">
                <div style={{ color: "#008060" }}>
                  <Icon source={CheckCircleIcon} tone="success" />
                </div>
                <Text variant="bodyMd" as="span">
                  {item}
                </Text>
              </InlineStack>
            ))}
          </BlockStack>

          <Divider />

          <InlineStack gap="300">
            <Button variant="primary" onClick={() => navigate("/app/dashboard")}>
              Go to Dashboard
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Complete;
