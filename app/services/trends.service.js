import prisma from "../db.server.js";

export async function getTrendsData(storeId, period = "week") {
  const now = new Date();
  let startDate = new Date();
  let groupByFormat = "day"; 

  switch (period) {
    case "day":
      startDate.setHours(now.getHours() - 24);
      groupByFormat = "hour";
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      groupByFormat = "day";
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      groupByFormat = "week";
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      groupByFormat = "month";
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const rawEvents = await prisma.event.findMany({
    where: {
      storeId,
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: "asc" },
    select: { type: true, timestamp: true }
  });


  return formatChartData(rawEvents, groupByFormat);
}


function formatChartData(events, interval) {
  const dataMap = {};

  events.forEach((event) => {
    let label;
    const date = new Date(event.timestamp);

    if (interval === "hour") label = date.getHours() + ":00";
    else if (interval === "day") label = date.toLocaleDateString("en-US", { weekday: "short" });
    else if (interval === "week") label = "Week " + Math.ceil(date.getDate() / 7);
    else if (interval === "month") label = date.toLocaleDateString("en-US", { month: "short" });

    if (!dataMap[label]) {
      dataMap[label] = { label, searches: 0, clicks: 0, views: 0 };
    }

    if (event.type === "search") dataMap[label].searches++;
    if (event.type === "recommendation_click") dataMap[label].clicks++;
    if (event.type === "recommendation_view") dataMap[label].views++;
  });

  return Object.values(dataMap);
}