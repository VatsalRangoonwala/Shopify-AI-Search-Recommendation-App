import { redirect } from "react-router";
import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

export async function requireOnboarding(request) {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store?.isOnboarding) {
    throw redirect("/app");
  }

  return { store, session };
}