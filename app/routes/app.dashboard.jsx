import { useLoaderData } from "react-router";

export const loader = async ({ request }) => {
  const res = await fetch(`${process.env.APP_URL}/api/analytics`, {
    headers: request.headers,
  });

  return res.json();
};

export default function Dashboard() {
  const data = useLoaderData();

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Analytics Dashboard</h1>

      <div style={{ display: "grid", gap: "20px" }}>
        <div className="Searches">
          <p>{data.searches}</p>
        </div>

        <div className="Recommendation Clicks">
          <p>{data.clicks}</p>
        </div>

        <div className="Add to Cart">
          <p>{data.carts}</p>
        </div>

        <div className="Purchases">
          <p>{data.purchases}</p>
        </div>

        <div className="Conversion Rate">
          <p>{data.conversionRate}%</p>
        </div>
      </div>
    </div>
  );
}