import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  BlockStack,
  Card,
  Text,
  Button,
  InlineStack,
  Divider,
  Badge,
} from "@shopify/polaris";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";
import Checklist from "../components/data-quality/Checklist.jsx";
import InfoCards from "../components/data-quality/Infocards.jsx";
import WarningBanner from "../components/data-quality/WarningBanner.jsx";
import StatusSummary from "../components/data-quality/StatusSummary.jsx";
import DataIssues from "../components/data-quality/Dataissues.jsx";
import WeightModel from "../components/data-quality/Weightmodel.jsx";

const DataQualityPage = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});

  const handleToggle = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <OnboardingLayout currentStep={2}>
      <BlockStack gap="600">
        {/* Header */}
        <BlockStack gap="200">
          <Text variant="headingLg" as="h1">
            🧠 Improve Your AI Results
          </Text>
          <Text variant="bodyLg" as="p" tone="subdued">
            Your product data directly impacts search and recommendations.
          </Text>
        </BlockStack>

        {/* Digital Fingerprint + Signal Cards */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text variant="headingSm" as="h3">
                The "Digital Fingerprint": What the AI Needs to See
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Unlike traditional search engines, our AI understands the{" "}
                <Text as="span" fontWeight="semibold">
                  meaning
                </Text>{" "}
                behind your products — not just keywords. It builds a digital
                fingerprint from your core product data.
              </Text>
            </BlockStack>
            <InfoCards />
            <Divider />
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="success">Gold Standard</Badge>
                <Text variant="bodySm" as="span" tone="subdued">
                  Advisable fields that unlock the best AI performance
                </Text>
              </InlineStack>
              <Text variant="bodySm" as="p">
                <Text as="span" fontWeight="semibold">Title:</Text>{" "}
                "Men's Lightweight Waterproof Trail Runner" beats "Trail Shoe v2" — be descriptive.
                {" "}<Text as="span" fontWeight="semibold">Description:</Text>{" "}
                2–3 sentences covering materials, use cases, and selling points.
                {" "}<Text as="span" fontWeight="semibold">Category & Brand:</Text>{" "}
                Helps the AI distinguish context (e.g. "Apple" fruit vs. tech).
                {" "}<Text as="span" fontWeight="semibold">Tags:</Text>{" "}
                Add attributes not in the title: "minimalist," "vintage," "eco-friendly."
              </Text>
            </BlockStack>
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="critical">Required</Badge>
                <Text variant="bodySm" as="span" tone="subdued">
                  Minimum criteria — products without these cannot be indexed
                </Text>
              </InlineStack>
              <Text variant="bodySm" as="p">
                Every product must have a <Text as="span" fontWeight="semibold">Title</Text> and a{" "}
                <Text as="span" fontWeight="semibold">unique Product ID</Text>. Without these,
                the product cannot be indexed or tracked.
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>

        {/* Data Quality Checklist */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingSm" as="h3">
              Data Quality Checklist
            </Text>
            <Checklist checked={checked} onToggle={handleToggle} />
          </BlockStack>
        </Card>

        {/* Interaction Weight Model */}
        <WeightModel />

        {/* Common Data Issues */}
        <DataIssues />

        {/* Warning */}
        <WarningBanner />

        {/* Diagnostic */}
        <StatusSummary />

        {/* CTA */}
        <InlineStack gap="300" align="end">
          {/* <Button variant="plain" onClick={() => navigate("/app/onboarding/sync")}>
            Skip for Now
          </Button> */}
          <Button url="#" variant="tertiary">
            View Full Guide
          </Button>
          <Button variant="primary" onClick={() => navigate("/app/onboarding/sync")}>
            Continue Setup
          </Button>
        </InlineStack>
      </BlockStack>
    </OnboardingLayout>
  );
};

export default DataQualityPage;