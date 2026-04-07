import React, { useState, useCallback, useMemo } from "react";
import { Page, Banner, ContextualSaveBar, BlockStack } from "@shopify/polaris";
import SearchSettings from "../components/settings/SearchSettings.jsx";
import RecommendationSettings from "../components/settings/RecommendationSettings.jsx";
import AISettings from "../components/settings/AISettings.jsx";
import FilterSettings from "../components/settings/FilterSettings.jsx";
import SortingSettings from "../components/settings/SortingSettings.jsx";
import DangerZone from "../components/settings/DangerZone.jsx";

const defaultState = {
  searchEnabled: true,
  searchMode: "ai",
  typoTolerance: true,
  maxResults: "20",
  recsEnabled: true,
  recTypes: {
    relatedProducts: true,
    trending: true,
    recentlyViewed: false,
  },
  maxRecs: "8",
  aiEnabled: true,
  intentSearch: true,
  smartRecs: true,
  aiMode: "balanced",
  fallback: "trending",
  filtersEnabled: true,
  filterUI: "checkbox",
  multiSelect: true,
  collapseFilters: false,
  sortingEnabled: true,
  defaultSort: "popularity",
  sortOptionsEnabled: {
    price_asc: true,
    price_desc: true,
    newest: true,
    popularity: true,
  },
  autoSync: true,
  syncFrequency: "daily",
};

export default function Settings() {
  const [state, setState] = useState(defaultState);
  const [saved, setSaved] = useState(defaultState);
  const [toast, setToast] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(saved),
    [state, saved],
  );

  const onChange = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    setSaved(state);
    setToast("Settings saved successfully!");
    setTimeout(() => setToast(null), 3000);
  }, [state]);

  const handleDiscard = useCallback(() => {
    setState(saved);
  }, [saved]);

  const handleSync = useCallback(() => {
    setToast("Sync started…");
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDanger = useCallback((action) => {
    const messages = {
      reset: "All settings have been reset.",
      disconnect: "Store disconnected.",
      delete: "All data deleted.",
    };

    if (
      window.confirm(
        `Are you sure you want to ${action}? This cannot be undone.`,
      )
    ) {
      if (action === "reset") {
        setState(defaultState);
        setSaved(defaultState);
      }
      setToast(messages[action]);
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  return (
    <>
      {isDirty && (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{ onAction: handleSave, content: "Save" }}
          discardAction={{ onAction: handleDiscard, content: "Discard" }}
        />
      )}

      <Page title="Settings" fullWidth>
        <div style={{ width: "100%" }}>
          <BlockStack gap="400">
            {toast && (
              <Banner tone="success" onDismiss={() => setToast(null)}>
                <p>{toast}</p>
              </Banner>
            )}

            {/* <SearchSettings state={state} onChange={onChange} /> */}
            {/* <RecommendationSettings state={state} onChange={onChange} /> */}
            {/* <AISettings state={state} onChange={onChange} /> */}
            <FilterSettings state={state} onChange={onChange} />
            <SortingSettings state={state} onChange={onChange} />
            <DangerZone onAction={handleDanger} />
          </BlockStack>
        </div>
      </Page>
    </>
  );
}
