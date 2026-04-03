import React from "react";
import { useNavigate } from "react-router";
import { Page, Button, Box, InlineStack, BlockStack, Text, ProgressBar } from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import StepIndicator from "./StepIndicator.jsx";

const STEPS = [
  { label: "Welcome", path: "/app/onboarding/welcome" },
  { label: "Data Quality", path: "/app/onboarding/data-quality" },
  { label: "Sync", path: "/app/onboarding/sync" },
  { label: "Filters", path: "/app/onboarding/filters" },
  { label: "Sorting", path: "/app/onboarding/sorting" },
  { label: "Storefront", path: "/app/onboarding/storefront" },
  { label: "AI", path: "/app/onboarding/ai" },
  { label: "Complete", path: "/app/onboarding/complete" },
];

const OnboardingLayout = ({ currentStep, children }) => {
  const navigate = useNavigate();
  const stepIndex = currentStep - 1;
  const progress = Math.round((currentStep / STEPS.length) * 100);

  const handleBack = () => {
    if (stepIndex > 0) {
      navigate(STEPS[stepIndex - 1].path);
    }
  };

  return (
    <Page>
      <BlockStack gap="600">
        <Box>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              {stepIndex > 0 ? (
                <Button icon={ArrowLeftIcon} variant="plain" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Text variant="bodySm" as="span" tone="subdued">
                Step {currentStep} of {STEPS.length}
              </Text>
            </InlineStack>
            <ProgressBar progress={progress} size="small" tone="primary" />
            <StepIndicator steps={STEPS} currentStep={stepIndex} />
          </BlockStack>
        </Box>
        {children}
      </BlockStack>
    </Page>
  );
};

export default OnboardingLayout;
