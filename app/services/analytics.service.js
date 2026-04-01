import prisma from "../db.server.js";

export async function getAnalytics(storeId) {
  const events = await prisma.event.findMany({
    where: { storeId },
  });

  let searches = 0;
  let clicks = 0;
  let carts = 0;
  let purchases = 0;

  for (const e of events) {
    if (e.type === "search") searches++;
    if (e.type === "recommendation_click") clicks++;
    if (e.type === "add_to_cart") carts++;
    if (e.type === "purchase") purchases++;
  }

  const conversionRate = clicks
    ? ((purchases / clicks) * 100).toFixed(2)
    : 0;

  return {
    searches,
    clicks,
    carts,
    purchases,
    conversionRate,
  };
}