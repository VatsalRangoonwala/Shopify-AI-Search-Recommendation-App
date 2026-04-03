import React from "react";
import { Banner, List } from "@shopify/polaris";

const WarningBanner = () => (
  <Banner title="What happens if you skip this?" tone="warning">
    <List type="bullet">
      <List.Item>Poor product recommendations that don't convert</List.Item>
      <List.Item>Irrelevant search results frustrating your customers</List.Item>
      <List.Item>Lower conversion rates and missed revenue</List.Item>
    </List>
  </Banner>
);

export default WarningBanner;
