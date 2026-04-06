import prisma from "../db.server.js";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import { useNavigate,useLoaderData } from "react-router";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  return {
    isOnboarding: store?.isOnboarding,
  };
};

export default function AppIndex() {
  const { isOnboarding } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnboarding === false) {
      navigate("/app/dashboard");
    } else {
      navigate("/app/onboarding/welcome");
    }
  }, [isOnboarding, navigate]);

  return null;
}
