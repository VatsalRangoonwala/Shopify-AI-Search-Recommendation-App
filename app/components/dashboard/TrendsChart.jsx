import React from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Select,
  Layout,
  SkeletonBodyText,
} from "@/pshopifyolaris";

const TrendsChart = ({
  data = [],
  onFilterChange,
  selectedPeriod,
  isLoading,
}) => {
  const options = [
    { label: "Last 24 hours", value: "day" },
    { label: "Last 7 days", value: "week" },
    { label: "This Month", value: "month" },
    { label: "Last year", value: "year" },
  ];

  // Calculate max value for scaling the bars
  const maxValue = Math.max(...data.map((d) => d.searches || 0), 1);
  const currentPeriodLabel =
    options.find((o) => o.value === selectedPeriod)?.label || "Last 7 days";

  // Shared Bar Component for consistent styling
  const ChartBar = ({ height, label, color, value, isMax }) => (
    <BlockStack inlineAlign="center" gap="100">
      {/* Value */}
      <Text
        variant="bodyXs"
        as="span"
        fontWeight={isMax ? "bold" : "regular"}
        tone={isMax ? "success" : "subdued"}
      >
        {value}
      </Text>

      {/* Bar container */}
      <Box
        as="div"
        title={value}
        style={{
          height: "130px",
          display: "flex",
          alignItems: "flex-end",
          width: "28px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${height}%`,
            background: color,
            borderRadius: "6px",
            transition: "all 0.35s ease",
            boxShadow: isMax ? "0 0 0 2px rgba(0,0,0,0.1)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scaleY(1.1)";
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scaleY(1)";
            e.currentTarget.style.opacity = "1";
          }}
        />
      </Box>

      {/* Label */}
      <Text
        variant="bodyXs"
        as="span"
        tone="subdued"
        style={{
          transform: label.length > 5 ? "rotate(-40deg)" : "none",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Text>
    </BlockStack>
  );

  return (
    <BlockStack gap="400">
      {/* Header Section */}
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingLg" as="h2">
          Trends
        </Text>
        <div style={{ width: "160px" }}>
          <Select
            label="Date range"
            labelHidden
            options={options}
            onChange={onFilterChange}
            value={selectedPeriod}
            disabled={isLoading}
          />
        </div>
      </InlineStack>

      <Layout>
        {/* Searches Card */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm" as="h3" tone="subdued">
                Searches ({currentPeriodLabel})
              </Text>

              {isLoading ? (
                <Box paddingBlockEnd="400">
                  <SkeletonBodyText lines={3} />
                </Box>
              ) : (
                <Box overflowX="auto" paddingBlockEnd="200">
                  <InlineStack gap="200" wrap={false} align="start">
                    {data.map((d, i) => (
                      <ChartBar
                        key={i}
                        height={(d.searches / maxValue) * 100}
                        label={d.label}
                        value={`${d.searches} searches`}
                        color="var(--p-color-bg-fill-brand-selected)"
                      />
                    ))}
                  </InlineStack>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* CTR Card */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm" as="h3" tone="subdued">
                CTR Trend (%)
              </Text>

              {isLoading ? (
                <Box paddingBlockEnd="400">
                  <SkeletonBodyText lines={3} />
                </Box>
              ) : (
                <Box overflowX="auto" paddingBlockEnd="200">
                  <InlineStack gap="200" wrap={false} align="start">
                    {data.map((d, i) => {
                      const ctr = d.views > 0 ? (d.clicks / d.views) * 100 : 0;
                      return (
                        <ChartBar
                          key={i}
                          height={Math.min(ctr * 5, 100)} // Multiplier for visual impact
                          label={d.label}
                          value={`${ctr.toFixed(1)}% CTR`}
                          color="var(--p-color-bg-fill-info-secondary)"
                        />
                      );
                    })}
                  </InlineStack>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );
};

export default TrendsChart;
