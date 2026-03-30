import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const body = await request.json();

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  const filter = await prisma.filter.create({
    data: {
      storeId: store.id,
      name: body.name,
      field: body.field,
      type: body.type,
      uiType: body.uiType,
      values: body.values,
      position: 0,
    },
  });

  return filter;
};
