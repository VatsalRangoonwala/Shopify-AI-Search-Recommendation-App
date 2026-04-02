import React from "react";
import { InlineStack, Box, Text, Icon } from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <Box paddingBlockStart="200" paddingBlockEnd="200">
      <InlineStack gap="100" wrap={true}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step.label}>
              <InlineStack gap="100" blockAlign="center">
                <Box
                  background={
                    isCurrent
                      ? "bg-fill-info"
                      : isCompleted
                      ? "bg-fill-success"
                      : "bg-fill-secondary"
                  }
                  borderRadius="full"
                  minWidth="24px"
                  minHeight="24px"
                  padding="050"
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: 12,
                      fontWeight: 600,
                      color: isCurrent || isCompleted ? "#fff" : "#8c9196",
                      background: isCurrent
                        ? "#2c6ecb"
                        : isCompleted
                        ? "#008060"
                        : "#e4e5e7",
                    }}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                </Box>
                <Text
                  variant="bodySm"
                  as="span"
                  fontWeight={isCurrent ? "semibold" : "regular"}
                  tone={isCurrent ? undefined : "subdued"}
                >
                  {step.label}
                </Text>
              </InlineStack>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: 20,
                    height: 1,
                    background: isCompleted ? "#008060" : "#e4e5e7",
                    alignSelf: "center",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </InlineStack>
    </Box>
  );
};

export default StepIndicator;
