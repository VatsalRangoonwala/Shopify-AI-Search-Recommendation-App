import React from "react";
import { Card, FormLayout, TextField, Checkbox } from "@shopify/polaris";

export default function SearchSettings({ state, onChange }) {
  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: 4 }}>Search Settings</h2>
        <p style={{ color: "#6d7175", marginBottom: 16, fontSize: "13px" }}>
          Configure how search works on your storefront.
        </p>
        <FormLayout>
          <Checkbox
            label="Enable Search"
            checked={state.searchEnabled}
            onChange={(v) => onChange("searchEnabled", v)}
          />
          <div style={{ opacity: state.searchEnabled ? 1 : 0.5, pointerEvents: state.searchEnabled ? "auto" : "none" }}>
            <FormLayout>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 500, fontSize: "14px", marginBottom: 8 }}>Search Mode</legend>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="searchMode"
                    checked={state.searchMode === "keyword"}
                    onChange={() => onChange("searchMode", "keyword")}
                  />
                  Keyword-based
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="searchMode"
                    checked={state.searchMode === "ai"}
                    onChange={() => onChange("searchMode", "ai")}
                  />
                  AI Intent-based
                </label>
              </fieldset>
              <Checkbox
                label="Typo Tolerance"
                helpText="Automatically correct minor typos in search queries."
                checked={state.typoTolerance}
                onChange={(v) => onChange("typoTolerance", v)}
              />
              <TextField
                label="Max Results Per Page"
                type="number"
                value={state.maxResults}
                onChange={(v) => onChange("maxResults", v)}
                autoComplete="off"
                helpText="Number of search results shown per page."
              />
            </FormLayout>
          </div>
        </FormLayout>
      </div>
    </Card>
  );
}
