import { authenticate } from "../shopify.server.js";
import { resetSettings, deleteAllData } from "../services/admin.service.js";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    const body = await request.json();
    const act = body?.action;

    if (!act) {
      return Response.json(
        { success: false, error: "action is required" },
        { status: 400 },
      );
    }

    if (act === "reset") {
      await resetSettings(session.shop);
      return Response.json({ success: true });
    }

    if (act === "delete") {
      await deleteAllData(session.shop);
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: "unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Admin danger action error:", error);
    return Response.json(
      { success: false, error: error?.message ?? "Something went wrong" },
      { status: 500 },
    );
  }
};
