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
      change: "+14.2%", // These would ideally come from a 'comparison' object in your API
      trend: "up",
      icon: SearchIcon,
    },
    {
      title: "AI Recommendations Shown",
      value: data?.recommendationsShown || "0",
      change: "+22.5%",
      trend: "up",
      icon: ThumbsUpIcon,
    },
    {
      title: "Recommendation Clicks",
      value: data?.recommendationClicks || "0",
      change: "+8.7%",
      trend: "up",
      icon: TargetIcon,
    },
    {
      title: "Conversion Boost",
      value: data?.conversionBoost || "0%",
      change: "+3.1%",
      trend: "up",
      icon: ChartVerticalFilledIcon,
    },
    {
      title: "Revenue Influenced",
      value: data?.revenueInfluenced || "$0",
      change: "+18.4%",
      trend: "up",
      icon: CashDollarIcon,
    },
  ];
  return (
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Performance Overview</Text>
    
    <Layout>
      {kpis.map((kpi) => (
        /* Using Layout.Section with fullWidth={false} allows cards to 
           automatically wrap. We use a Box with a min-width to prevent 
           them from getting too skinny on tablet screens.
        */
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

              {/* <InlineStack gap="100" blockAlign="center">
                <Text
                  variant="bodySm"
                  as="span"
                  fontWeight="bold"
                  tone={kpi.trend === "up" ? "success" : "critical"}
                >
                  {kpi.trend === "up" ? "↑" : "↓"} {kpi.change}
                </Text>
                <Text variant="bodySm" as="span" tone="subdued">
                  vs last period
                </Text>
              </InlineStack> */}
            </BlockStack>
          </Card>
        </Layout.Section>
      ))}
    </Layout>
  </BlockStack>
)};

export default KPISection;