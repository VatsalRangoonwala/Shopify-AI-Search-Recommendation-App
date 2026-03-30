import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const fetcher = useFetcher();
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (fetcher.data?.jobId) {
      setJobId(fetcher.data.jobId);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/sync-status?jobId=${jobId}`);
      const data = await res.json();
      setStatus(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div>
      <fetcher.Form method="post" action="/api/sync">
        <button type="submit">Start Sync</button>
      </fetcher.Form>

      {status && (
        <p>
          {status.processed} / {status.totalProducts} synced
        </p>
      )}
    </div>
  );
}
