import React from "react";
import { Card, Banner, ButtonGroup, Button } from "@shopify/polaris";

export default function DangerZone({ onAction }) {
  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: 4, color: "#d72c0d" }}>
          ⚠️ Danger Zone
        </h2>
        <p style={{ color: "#6d7175", marginBottom: 16, fontSize: "13px" }}>
          These actions are destructive and cannot be undone. Proceed with caution.
        </p>
        <Banner tone="critical">
          <p>Resetting settings, disconnecting your store, or deleting data is permanent. Make sure you understand the consequences before proceeding.</p>
        </Banner>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" tone="critical" onClick={() => onAction("reset")}>
            Reset All Settings
          </Button>
          <Button variant="primary" tone="critical" onClick={() => onAction("disconnect")}>
            Disconnect Store
          </Button>
          <Button variant="primary" tone="critical" onClick={() => onAction("delete")}>
            Delete All Data
          </Button>
        </div>
      </div>
    </Card>
  );
}
