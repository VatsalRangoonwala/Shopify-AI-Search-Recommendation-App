import React from "react";
import { Card, FormLayout, Checkbox, Select } from "@shopify/polaris";

const fallbackOptions = [
  { label: "Show Trending", value: "trending" },
  { label: "Show Best Sellers", value: "bestsellers" },
];

export default function AISettings({ state, onChange }) {
  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: 4 }}>AI Settings</h2>
        <p style={{ color: "#6d7175", marginBottom: 16, fontSize: "13px" }}>
          Fine-tune the AI engine powering search and recommendations.
        </p>
        <FormLayout>
          <Checkbox
            label="Enable AI"
            checked={state.aiEnabled}
            onChange={(v) => onChange("aiEnabled", v)}
          />
          <div style={{ opacity: state.aiEnabled ? 1 : 0.5, pointerEvents: state.aiEnabled ? "auto" : "none" }}>
            <FormLayout>
              <Checkbox
                label="Enable Intent Search"
                helpText="Use AI to understand what customers mean, not just what they type."
                checked={state.intentSearch}
                onChange={(v) => onChange("intentSearch", v)}
              />
              <Checkbox
                label="Enable Smart Recommendations"
                helpText="AI-powered product suggestions based on behavior."
                checked={state.smartRecs}
                onChange={(v) => onChange("smartRecs", v)}
              />
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 500, fontSize: "14px", marginBottom: 8 }}>AI Mode</legend>
                {["conservative", "balanced", "aggressive"].map((mode) => (
                  <label key={mode} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer", textTransform: "capitalize" }}>
                    <input
                      type="radio"
                      name="aiMode"
                      checked={state.aiMode === mode}
                      onChange={() => onChange("aiMode", mode)}
                    />
                    {mode}
                  </label>
                ))}
              </fieldset>
              <Select
                label="Fallback Behavior"
                helpText="What to show when AI has no recommendations."
                options={fallbackOptions}
                value={state.fallback}
                onChange={(v) => onChange("fallback", v)}
              />
            </FormLayout>
          </div>
        </FormLayout>
      </div>
    </Card>
  );
}
