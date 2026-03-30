import { useState } from "react";

export default function FiltersPage() {
  const [name, setName] = useState("");
  const [values, setValues] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/admin/filters", {
      method: "POST",
      body: JSON.stringify({
        name,
        field: "tags",
        type: "multi-select",
        uiType: "checkbox",
        values: values.split(","),
      }),
    });
  };

  return (
    <div>
      <h1>Create Filter</h1>

      <input
        placeholder="Filter Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Values (comma separated)"
        onChange={(e) => setValues(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Filter</button>
    </div>
  );
}
