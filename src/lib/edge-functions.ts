import { supabase } from "@/integrations/supabase/client";

function errorMessageFromData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const message =
    (data as { error?: unknown; message?: unknown }).error ??
    (data as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export async function invokeEdgeFunction<TResponse>(
  name: string,
  body?: Record<string, unknown>,
): Promise<TResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  const { data, error } = await supabase.functions.invoke<TResponse>(name, {
    body,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (error) {
    let message = error.message;
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const payload = await context.clone().json();
        message = errorMessageFromData(payload) ?? message;
      } catch {
        try {
          message = (await context.clone().text()) || message;
        } catch {
          // Keep the original Supabase Functions error.
        }
      }
    }
    throw new Error(message);
  }

  return data as TResponse;
}
