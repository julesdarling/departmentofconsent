import { errorResponse, jsonResponse, optionsResponse } from "../_shared/http.ts";
import { createAdminClient, requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const supabase = createAdminClient();
    await supabase.from("profiles").delete().eq("user_id", user.id);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(error.message);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
});
