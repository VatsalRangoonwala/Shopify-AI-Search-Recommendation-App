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
  CheckCircleIcon,
} from "@shopify/polaris-icons";

const KPISection = ({ data }) => {
  const synced = Number(data?.syncedProducts ?? 0);
  const total = Number(data?.totalProducts ?? 0);
  const percent = total > 0 ? Math.round((synced / total) * 100) : 0;

  const kpis = [
    {
      title: "Synced Products",
      value: data?.formatted?.syncedProducts || data?.syncedProducts || "0",
      icon: CheckCircleIcon,
    },
    // {
    //   title: "Total Products",
    //   value: data?.formatted?.totalProducts || data?.totalProducts || "0",
    //   icon: TargetIcon,
    // },
    {
      title: "Total Searches",
      value: data?.totalSearches || "0",
      icon: SearchIcon,
    },
    // {
    //   title: "AI Recommendations Shown",
    //   value: data?.recommendationClicks || "0",
    //   icon: ThumbsUpIcon,
    // },
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
      <Text variant="headingMd" as="h2">
        Performance Overview
      </Text>

      {/* Combined synced / total card */}
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Box maxWidth="80%">
                  <Text variant="bodySm" as="p" tone="subdued">
                    Products Synced
                  </Text>
                </Box>
                <div>
                  <Text variant="headingMd">
                    {data?.formatted?.syncedProducts || synced}
                  </Text>
                  <Text variant="bodySm">
                    of {data?.formatted?.totalProducts || total} total (
                    {percent}%)
                  </Text>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

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
  );
};

export default KPISection;
