import { getVercelOidcToken } from "@vercel/oidc";
import { Client, SessionNotActiveError } from "eve/client";
import { headers } from "next/headers";
import { restockById } from "@zeke/logic";
import { readState, updateState } from "@zeke/store";

/**
 * Where the eve agent's routes live. Locally, `npm run dev:all` serves the app and the agent on one
 * origin, so the request's own host works. Set EVE_URL to point somewhere else.
 */
async function agentBaseUrl() {
  if (process.env.EVE_URL) return process.env.EVE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export interface TellResult {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

const NOT_RUNNING = "Zeke didn't get the message. Start the app and agent together with `npm run dev:all`, then try again.";

/** Message the eve session that owns a restock, or start one if it has none (or it ended). */
export async function tellZeke(restockId: string | null, message: string): Promise<TellResult> {
  try {
    // On Vercel, authenticate to the eve channel with the project's OIDC token. Locally,
    // localDev() in the channel accepts the request without credentials.
    const client = new Client({
      baseUrl: await agentBaseUrl(),
      ...(process.env.VERCEL
        ? { auth: { vercelOidc: { token: async () => await getVercelOidcToken() } } }
        : {}),
    });
    const restock = restockId ? restockById(await readState(), restockId) : undefined;

    if (restock?.sessionId) {
      try {
        const session = client.sessions.attach(restock.sessionId);
        await session.send(message);
        return { ok: true, sessionId: restock.sessionId };
      } catch (error) {
        if (!(SessionNotActiveError.is(error) && !error.retryable)) throw error;
        // The old session ended; carry on in a new one below.
      }
    }

    const { session } = await client.sessions.create({ message });
    const sessionId = session.state.sessionId;
    if (restockId) {
      await updateState((state) => {
        const r = restockById(state, restockId);
        if (r) r.sessionId = sessionId;
      });
    }
    return { ok: true, sessionId };
  } catch (error) {
    console.error("[zeke] could not reach the agent", error);
    return { ok: false, error: NOT_RUNNING };
  }
}
