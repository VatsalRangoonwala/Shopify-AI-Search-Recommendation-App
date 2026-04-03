import React from "react";
import {
  BlockStack,
  InlineGrid,
  Card,
  Text,
  Icon,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import {
  ProductIcon,
  TextBlockIcon,
  HashtagIcon,
  PersonIcon,
  FilterIcon,
} from "@shopify/polaris-icons";

const SIGNALS = [
  { icon: TextBlockIcon, label: "Titles", desc: "Product naming & keywords" },
  { icon: ProductIcon, label: "Descriptions", desc: "Features & details" },
  { icon: HashtagIcon, label: "Tags", desc: "Categories & attributes" },
  { icon: PersonIcon, label: "User Behavior", desc: "Views, clicks & purchases" },
];

const METADATA = [
  {
    icon: ProductIcon,
    label: "Price & Availability",
    desc: "Avoids recommending out-of-stock or wrong price-range items",
  },
  {
    icon: FilterIcon,
    label: "Attributes",
    desc: 'Enables precise filtering — e.g. "same shoe, Size 10 only"',
  },
];

const InfoCards = () => (
  <BlockStack gap="400">
    <BlockStack gap="300">
      <Text variant="headingSm" as="h3">
        Our AI creates a digital fingerprint using:
      </Text>
      <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
        {SIGNALS.map((s) => (
          <Card key={s.label} padding="400">
            <BlockStack gap="200" inlineAlign="center">
              <Icon source={s.icon} tone="primary" />
              <Text
                variant="bodyMd"
                as="span"
                fontWeight="semibold"
                alignment="center"
              >
                {s.label}
              </Text>
              <Text
                variant="bodySm"
                as="span"
                tone="subdued"
                alignment="center"
              >
                {s.desc}
              </Text>
            </BlockStack>
          </Card>
        ))}
      </InlineGrid>
    </BlockStack>

    <Divider />

    <BlockStack gap="300">
      <BlockStack gap="100">
        <Text variant="headingSm" as="h3">
          Commerce Metadata: Powering Smart Filters
        </Text>
        <Text variant="bodySm" as="p" tone="subdued">
          Metadata doesn't define <em>what</em> a product is — it controls{" "}
          <em>when</em> and <em>how</em> it appears to shoppers.
        </Text>
      </BlockStack>
      <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
        {METADATA.map((s) => (
          <Card key={s.label} padding="400">
            <InlineStack gap="300" blockAlign="start">
              <Icon source={s.icon} tone="primary" />
              <BlockStack gap="100">
                <Text variant="bodyMd" as="span" fontWeight="semibold">
                  {s.label}
                </Text>
                <Text variant="bodySm" as="span" tone="subdued">
                  {s.desc}
                </Text>
              </BlockStack>
            </InlineStack>
          </Card>
        ))}
      </InlineGrid>
    </BlockStack>
  </BlockStack>
);

export default InfoCards;