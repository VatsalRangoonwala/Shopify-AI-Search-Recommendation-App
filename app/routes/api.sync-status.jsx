import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  const job = await prisma.syncJob.findUnique({
    where: { id: jobId },
  });

  return job;
};
