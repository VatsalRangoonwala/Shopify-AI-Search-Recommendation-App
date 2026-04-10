import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const body = await request.json();

  const { diversity } = body;

  const store = await prisma.store.findUnique({
    where: {
      shop: session.shop,
    },
  });

  if (!store && !session) {
    return { error: "Session is required" };
  }

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      diversity: diversity ?? 0.0,
    },
  });

  return { success: true };
};
