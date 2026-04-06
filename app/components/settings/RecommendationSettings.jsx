import React from "react";
import { Card, FormLayout, TextField, Checkbox } from "@shopify/polaris";

const recTypes = [
  { key: "relatedProducts", label: "Related Products" },
  { key: "trending", label: "Trending" },
  { key: "recentlyViewed", label: "Recently Viewed" },
];

export default function RecommendationSettings({ state, onChange }) {
  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: 4 }}>Recommendation Settings</h2>
        <p style={{ color: "#6d7175", marginBottom: 16, fontSize: "13px" }}>
          Control how product recommendations appear to your customers.
        </p>
        <FormLayout>
          <Checkbox
            label="Enable Recommendations"
            checked={state.recsEnabled}
            onChange={(v) => onChange("recsEnabled", v)}
          />
          <div style={{ opacity: state.recsEnabled ? 1 : 0.5, pointerEvents: state.recsEnabled ? "auto" : "none" }}>
            <FormLayout>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 500, fontSize: "14px", marginBottom: 8 }}>Recommendation Types</legend>
                {recTypes.map((t) => (
                  <Checkbox
                    key={t.key}
                    label={t.label}
                    checked={state.recTypes[t.key]}
                    onChange={(v) => onChange("recTypes", { ...state.recTypes, [t.key]: v })}
                  />
                ))}
              </fieldset>
              <TextField
                label="Max Recommendations"
                type="number"
                value={state.maxRecs}
                onChange={(v) => onChange("maxRecs", v)}
                autoComplete="off"
                helpText="Maximum number of recommendations to show."
              />
            </FormLayout>
          </div>
        </FormLayout>
      </div>
    </Card>
  );
}
