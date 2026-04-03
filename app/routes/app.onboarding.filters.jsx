import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Text,
  BlockStack,
  Button,
  Checkbox,
  InlineStack,
  Divider,
  Box,
} from "@shopify/polaris";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";

const Filters = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoader,setSyncLoader] = useState(false)

  // 🔹 Step 1 + 2 combined
  const handleSyncFilters = async () => {
    try {
      setSyncLoader(true);

      // 1️⃣ Trigger background sync
      await fetch("/api/onboarding/filters", {
        headers: { "Content-Type": "application/json" },
      });

      // 2️⃣ Fetch updated filters
      const res = await fetch("/api/admin/filters");
      const data = await res.json();

      // 3️⃣ Map API response to UI format
      const formattedFilters = data.filters.map((f) => ({
        id: f.id,
        label: f.label,
        description: `${f.source} - ${f.sourceField || ""}`,
        checked: f.status === "selected",
        enabled: f.status !== "disabled",
      }));

      setFilters(formattedFilters);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncLoader(false);
    }
  };

  const toggleFilter = (id) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)),
    );
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // get selected filter IDs
      const selectedFilters = filters.filter((f) => f.checked).map((f) => f.id);

      if (selectedFilters.length === 0) {
        alert("Please select at least one filter");
        return;
      }

      await fetch("/api/admin/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterIds: selectedFilters }),
      });

      navigate("/app/onboarding/sorting");
    } catch (error) {
      console.error("Error saving filters:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={4}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              Configure Filters
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Choose which filters to enable for your storefront search
              experience.
            </Text>
          </BlockStack>

          <Divider />

          {/* 🔹 New Button */}
          <Button variant="primary" loading={syncLoader} onClick={handleSyncFilters}>
            Sync Filters
          </Button>

          <BlockStack gap="400">
            {filters.map((filter) => (
              <Box key={filter.id} padding="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Checkbox
                    label={filter.label}
                    helpText={filter.description}
                    checked={filter.checked}
                    disabled={!filter.enabled}
                    onChange={() => toggleFilter(filter.id)}
                  />
                </InlineStack>
              </Box>
            ))}
          </BlockStack>

          <Box paddingBlockStart="200">
            <Button
              variant="primary"
              loading={loading}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Filters;
