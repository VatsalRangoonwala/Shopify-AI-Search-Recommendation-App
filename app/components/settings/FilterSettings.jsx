import React, { useState } from "react";
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

export default function FilterSettings() {
  const [isSynced, setIsSynced] = useState(false);
  const [filters, setFilters] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // 🔹 Sync filters
  const handleSyncFilters = async () => {
    try {
      setSyncLoading(true);

      await fetch("/api/onboarding/filters");

      const res = await fetch("/api/admin/filters");
      const data = await res.json();

      const formatted = data.filters.map((f) => ({
        id: f.id,
        label: f.label,
        description: `${f.source} - ${f.sourceField || ""}`,
        checked: f.status === "selected",
      }));

      setFilters(formatted);
      setIsSynced(true);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncLoading(false);
    }
  };

  // 🔹 Toggle filter
  const toggleFilter = (id) => {
    const updated = filters.map((f) =>
      f.id === id ? { ...f, checked: !f.checked } : f,
    );

    setFilters(updated);
  };

  // 🔹 Save filters
  const handleSaveFilters = async () => {
    try {
      setSaveLoading(true);

      const selectedFilters = filters.filter((f) => f.checked).map((f) => f.id);

      if (selectedFilters.length === 0) {
        alert("Please select at least one filter");
        setSaveLoading(false);
        return;
      }

      await fetch("/api/admin/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterIds: selectedFilters }),
      });

      // Optional: show success
      console.log("Filters saved");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="500">
        {/* Header */}
        <BlockStack gap="200">
          <Text variant="headingMd">Filter Settings</Text>
          <Text tone="subdued">
            Configure how filters appear and behave in your storefront.
          </Text>
        </BlockStack>

        <Divider />

        <BlockStack gap="400">
          {/* Sync */}
          {!isSynced && (
            <Button
              variant="primary"
              loading={syncLoading}
              onClick={handleSyncFilters}
            >
              Sync Filters
            </Button>
          )}

          {/* Filters */}
          <BlockStack gap="300">
            {filters.length === 0 && (
              <Text tone="subdued">No filters synced yet.</Text>
            )}

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

          {/* ✅ Save Button */}
          {filters.length > 0 && (
            <Box paddingBlockStart="200">
              <Button
                variant="primary"
                loading={saveLoading}
                onClick={handleSaveFilters}
              >
                Save Filters
              </Button>
            </Box>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
