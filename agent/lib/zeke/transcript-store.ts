import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | undefined;

function sql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  client ??= neon(url, { fullResults: false });
  return client;
}

export interface StoredEvent {
  type: string;
  data: unknown;
  meta: { position: { line: number; index: number }; at: string };
}

export interface TranscriptRow {
  sessionId: string;
  event: StoredEvent;
  at: string;
}

/** One row per stream position, so retried hooks cannot duplicate an event. */
export async function ensureTranscriptTable() {
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS zeke_transcript (
    session_id text NOT NULL,
    line integer NOT NULL,
    idx integer NOT NULL,
    type text NOT NULL,
    data jsonb NOT NULL,
    at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, line, idx)
  )`;
}

export async function appendTranscriptEvent(input: {
  sessionId: string;
  line: number;
  index: number;
  type: string;
  data: unknown;
  at: string;
}) {
  const db = sql();
  const event: StoredEvent = {
    type: input.type,
    data: input.data,
    meta: { position: { line: input.line, index: input.index }, at: input.at },
  };
  await db`INSERT INTO zeke_transcript (session_id, line, idx, type, data, at)
    VALUES (${input.sessionId}, ${input.line}, ${input.index}, ${input.type}, ${JSON.stringify(event)}::jsonb, ${input.at})
    ON CONFLICT (session_id, line, idx) DO NOTHING`;
}

export async function readTranscriptEvents(sessionId?: string): Promise<TranscriptRow[]> {
  const db = sql();
  const rows = await db`SELECT session_id, data, at FROM zeke_transcript
    WHERE ${sessionId ?? null}::text IS NULL OR session_id = ${sessionId ?? null}
    ORDER BY session_id, line, idx`;
  return rows.map((row) => ({
    sessionId: row.session_id as string,
    at: new Date(row.at as string).toISOString(),
    event: (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as StoredEvent,
  }));
}
