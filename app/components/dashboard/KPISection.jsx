import React from "react";
import {
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  Box,
} from "@shopify/polaris";
import {
  SearchIcon,
  TargetIcon,
  ChartVerticalFilledIcon,
  CashDollarIcon,
  ThumbsUpIcon,
} from "@shopify/polaris-icons";

const KPISection = ({data}) => {

const kpis = [
    {
      title: "Total Searches",
      value: data?.totalSearches || "0",
      icon: SearchIcon,
    },
    {
      title: "AI Recommendations Shown",
      value: data?.recommendationClicks || "0",
      icon: ThumbsUpIcon,
    },
    {
      title: "Recommendation Clicks",
      value: data?.recommendationClicks || "0",
      icon: TargetIcon,
    },
    {
      title: "Conversion Boost",
      value: data?.conversionRate || "0%",
      icon: ChartVerticalFilledIcon,
    },
    {
      title: "Revenue Influenced",
      value: data?.revenueInfluenced || "$0",
      icon: CashDollarIcon,
    },
  ];
  return (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Performance Overview</Text>
    
    <Layout>
      {kpis.map((kpi) => (
        <Layout.Section key={kpi.title} variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Box maxWidth="80%">
                  <Text variant="bodySm" as="p" tone="subdued" breakWord>
                    {kpi.title}
                  </Text>
                </Box>
                <Icon source={kpi.icon} tone="subdued" />
              </InlineStack>
              
              <Box paddingBlockStart="100">
                <Text variant="heading2xl" as="p">
                  {kpi.value}
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      ))}
    </Layout>
  </BlockStack>
)};

export default KPISection;