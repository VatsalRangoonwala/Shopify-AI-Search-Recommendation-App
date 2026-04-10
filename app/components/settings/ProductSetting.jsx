import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Text,
  BlockStack,
  Button,
  ProgressBar,
  Banner,
} from "@shopify/polaris";

const ProductSetting = () => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(0);
  const [total, setTotal] = useState(0);
  const [jobId, setJobId] = useState(null);

  const intervalRef = useRef(null);

  const progress = total ? Math.round((synced / total) * 100) : 0;
  const isComplete = total > 0 && synced >= total;

  const startSync = async () => {
    setSyncing(true);
    setSynced(0);

    const res = await fetch("/api/sync", {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await res.json();
    setJobId(data.jobId);
  };

  useEffect(() => {
    if (!jobId) return;

    intervalRef.current = setInterval(async () => {
      const res = await fetch(`/api/sync-status?jobId=${jobId}`);
      const job = await res.json();

      if (!job) return;

      setTotal(job.totalProducts || 0);
      setSynced(job.processed || 0);
      if (job.status === "completed") {
        clearInterval(intervalRef.current);
      }
    }, 2000); // every 2 sec

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text variant="headingXl" as="h2">
            Sync Products Manually
          </Text>
          <Text variant="bodyMd" tone="subdued">
            Manually sync products to keep your AI search and recommendations up
            to date.
          </Text>
        </BlockStack>

        {!isComplete && (
          <Button
            variant="primary"
            onClick={startSync}
            loading={syncing} // This adds the spinner
            disabled={syncing} // This prevents double-clicks
          >
            {syncing ? "Syncing products..." : "Sync again"}
          </Button>
        )}
        {syncing && (
          <BlockStack gap="300">
            <ProgressBar progress={progress} size="small" />
            <Text variant="bodySm" tone="subdued">
              {synced.toLocaleString()} / {total.toLocaleString()} products
              synced
            </Text>
          </BlockStack>
        )}

        {isComplete && (
          <BlockStack gap="400">
            <Banner title="Sync complete!" tone="success">
              All {total.toLocaleString()} products have been synced
              successfully.
            </Banner>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
};

export default ProductSetting;
