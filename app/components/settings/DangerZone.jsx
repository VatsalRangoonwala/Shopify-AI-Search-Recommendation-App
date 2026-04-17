import React, { useState, useCallback } from "react";
import {
  Card,
  Banner,
  Button,
  Modal,
  BlockStack,
  Toast,
} from "@shopify/polaris";

export default function DangerZone() {
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'reset' | 'delete' | null
  const [toast, setToast] = useState({
    active: false,
    content: "",
    error: false,
  });

  const handleResetAll = () => setActiveModal("reset");

  const handleDeleteAll = () => setActiveModal("delete");

  const performAction = useCallback(async (actionType) => {
    const isReset = actionType === "reset";

    try {
      if (isReset) setResetLoading(true);
      else setDeleteLoading(true);

      const res = await fetch("/api/admin/danger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType }),
      });

      const data = await res.json();

      if (data?.success) {
        setToast({
          active: true,
          content: isReset
            ? "Settings reset. Onboarding restarted."
            : "All data deleted.",
          error: false,
        });
        setActiveModal(null);
        // give the toast a moment, then reload
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setToast({
          active: true,
          content: data?.error || "Unknown error",
          error: true,
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        active: true,
        content: "An unexpected error occurred.",
        error: true,
      });
    } finally {
      if (isReset) setResetLoading(false);
      else setDeleteLoading(false);
    }
  }, []);

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: 4,
            color: "#d72c0d",
          }}
        >
          ⚠️ Danger Zone
        </h2>
        <p style={{ color: "#6d7175", marginBottom: 16, fontSize: "13px" }}>
          These actions are destructive and cannot be undone. Proceed with
          caution.
        </p>
        <Banner tone="critical">
          <p>
            Resetting settings, disconnecting your store, or deleting data is
            permanent. Make sure you understand the consequences before
            proceeding.
          </p>
        </Banner>
        <div
          style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}
        >
          <Button
            variant="primary"
            tone="critical"
            loading={resetLoading}
            onClick={handleResetAll}
          >
            Reset All Settings
          </Button>
          <Button
            variant="primary"
            tone="critical"
            loading={deleteLoading}
            onClick={handleDeleteAll}
          >
            Delete All Data
          </Button>
        </div>

        {/* Confirm Modals */}
        <Modal
          open={activeModal === "reset"}
          title="Reset All Settings"
          onClose={() => setActiveModal(null)}
          primaryAction={{
            content: "Reset",
            destructive: true,
            loading: resetLoading,
            onAction: () => performAction("reset"),
          }}
          secondaryActions={[
            { content: "Cancel", onAction: () => setActiveModal(null) },
          ]}
        >
          <Modal.Section>
            <BlockStack>
              <p>
                This will reset settings, filters and sorting to the default
                values and restart onboarding. This action cannot be undone.
              </p>
            </BlockStack>
          </Modal.Section>
        </Modal>

        <Modal
          open={activeModal === "delete"}
          title="Delete All Data"
          onClose={() => setActiveModal(null)}
          primaryAction={{
            content: "Delete",
            destructive: true,
            loading: deleteLoading,
            onAction: () => performAction("delete"),
          }}
          secondaryActions={[
            { content: "Cancel", onAction: () => setActiveModal(null) },
          ]}
        >
          <Modal.Section>
            <BlockStack>
              <p>
                Permanently delete all app data (products, filters, events,
                sorting, and sync jobs) for this store. This cannot be undone.
              </p>
            </BlockStack>
          </Modal.Section>
        </Modal>

        {toast.active && (
          <Toast
            content={toast.content}
            error={toast.error}
            onDismiss={() =>
              setToast({ active: false, content: "", error: false })
            }
          />
        )}
      </div>
    </Card>
  );
}
