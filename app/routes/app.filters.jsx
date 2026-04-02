import { useState, useEffect } from "react";

export default function FiltersPage() {
  const [name, setName] = useState("");
  const [values, setValues] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    loadFilter();
  }, []);

  const loadFilter = async () => {
    const res = await fetch("/api/admin/filters").catch((err) =>
      console.log(err),
    );
    const data = await res.json();
    setSuggestions(data.arr);
  };

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

      {suggestions?.map((filter) => (
        <div key={filter.id}>
          {" "}
          {/* Always add a key for performance */}
          <h3 style={{ fontWeight: "bold" }}>{filter.label}</h3>
          {filter.values?.map((val) => (
            <div key={val.id} style={{ marginLeft: "10px" }}>
              <p>
                {val.value} <span>({val.count})</span>
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
