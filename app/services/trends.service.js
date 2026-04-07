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
    select: { type: true, timestamp: true },
  });

  return formatChartData(rawEvents, groupByFormat, startDate, now);
}

function formatChartData(events, interval, startDate, endDate) {
  const dataMap = {};

  const cursor = new Date(startDate);


  if (interval === "month") {
    const start = new Date(endDate);
    start.setMonth(start.getMonth() - 11); 

    cursor.setTime(start.getTime());

    for (let i = 0; i < 12; i++) {
      const label = cursor.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit", 
      });

      dataMap[label] = {
        label,
        searches: 0,
        clicks: 0,
        views: 0,
      };

      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  if (interval !== "month") {
    while (cursor <= endDate) {
      let label;

      if (interval === "hour") {
        label = cursor.getHours() + ":00";
        cursor.setHours(cursor.getHours() + 1);
      } else if (interval === "day") {
        label = cursor.toLocaleDateString("en-US", { weekday: "short" });
        cursor.setDate(cursor.getDate() + 1);
      } else if (interval === "week") {
        label = "Week " + Math.ceil(cursor.getDate() / 7);
        cursor.setDate(cursor.getDate() + 7);
      }

      dataMap[label] = {
        label,
        searches: 0,
        clicks: 0,
        views: 0,
      };
    }
  }

  events.forEach((event) => {
    const date = new Date(event.timestamp);
    let label;

    if (interval === "hour") label = date.getHours() + ":00";
    else if (interval === "day")
      label = date.toLocaleDateString("en-US", { weekday: "short" });
    else if (interval === "week")
      label = "Week " + Math.ceil(date.getDate() / 7);
    else if (interval === "month")
      label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

    if (!dataMap[label]) return;

    if (event.type === "search") dataMap[label].searches++;
    if (event.type === "recommendation_click") dataMap[label].clicks++;
    if (event.type === "recommendation_view") dataMap[label].views++;
  });

  return Object.values(dataMap);
}
