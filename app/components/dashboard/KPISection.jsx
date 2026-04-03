import React from "react";
import { Layout, Card, Text, BlockStack, InlineStack, Icon, Box } from "@shopify/polaris";
import {
  SearchIcon,
  TargetIcon,
  ChartVerticalFilledIcon,
  CashDollarIcon,
  ThumbsUpIcon,
} from "@shopify/polaris-icons";

const kpis = [
  {
    title: "Total Searches",
    value: "12,845",
    change: "+14.2%",
    trend: "up",
    icon: SearchIcon,
  },
  {
    title: "AI Recommendations Shown",
    value: "8,321",
    change: "+22.5%",
    trend: "up",
    icon: ThumbsUpIcon,
  },
  {
    title: "Recommendation Clicks",
    value: "3,429",
    change: "+8.7%",
    trend: "up",
    icon: TargetIcon,
  },
  {
    title: "Conversion Boost",
    value: "23.5%",
    change: "+3.1%",
    trend: "up",
    icon: ChartVerticalFilledIcon,
  },
  {
    title: "Revenue Influenced",
    value: "$48,290",
    change: "+18.4%",
    trend: "up",
    icon: CashDollarIcon,
  },
];

const KPISection = () => (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Performance Overview</Text>
    <InlineStack gap="400" wrap>
      {kpis.map((kpi) => (
        <div key={kpi.title} style={{ flex: "1 1 180px", minWidth: 180 }}>
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodySm" as="p" tone="subdued">{kpi.title}</Text>
                <Icon source={kpi.icon} tone="subdued" />
              </InlineStack>
              <Text variant="heading2xl" as="p">{kpi.value}</Text>
              <Text variant="bodySm" as="span" tone={kpi.trend === "up" ? "success" : "critical"}>
                {kpi.trend === "up" ? "↑" : "↓"} {kpi.change}
              </Text>
            </BlockStack>
          </Card>
        </div>
      ))}
    </InlineStack>
  </BlockStack>
);

export default KPISection;
