import React from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Icon, Box } from "@shopify/polaris";
import { SearchIcon, TargetIcon, ChartVerticalFilledIcon } from "@shopify/polaris-icons";

const stats = [
  {
    title: "Searches",
    value: "12,847",
    change: "+14.2%",
    trend: "positive",
    description: "Total searches this month",
    icon: SearchIcon,
  },
  {
    title: "Recommendation Clicks",
    value: "3,429",
    change: "+8.7%",
    trend: "positive",
    description: "Clicks on AI recommendations",
    icon: TargetIcon,
  },
  {
    title: "Conversion Boost",
    value: "23.5%",
    change: "+3.1%",
    trend: "positive",
    description: "Increase from AI-powered features",
    icon: ChartVerticalFilledIcon,
  },
];

const Dashboard = () => {
  return (
    <Page title="Dashboard">
      <Layout>
        {stats.map((stat) => (
          <Layout.Section key={stat.title} variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingSm" as="h3" tone="subdued">
                    {stat.title}
                  </Text>
                  <Icon source={stat.icon} tone="subdued" />
                </InlineStack>
                <Text variant="heading2xl" as="p">
                  {stat.value}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text
                    variant="bodySm"
                    as="span"
                    tone="success"
                  >
                    {stat.change}
                  </Text>
                  <Text variant="bodySm" as="span" tone="subdued">
                    {stat.description}
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
};

export default Dashboard;
