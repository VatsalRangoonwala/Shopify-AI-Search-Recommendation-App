// import { redirect } from "react-router";
// import prisma from "../db.server.js";
// import { authenticate } from "../shopify.server";

// export const loader = async ({ request }) => {
//   const { session } = await authenticate.admin(request);

//   const store = await prisma.store.findUnique({
//     where: { shop: session.shop }
//   });

//   return redirect(
//     store?.isOnboarding === false
//       ? "/app/dashboard"
//       : "/app/onboarding/welcome"
//   );
// };

export default function AppIndex() {
  return null;
}
