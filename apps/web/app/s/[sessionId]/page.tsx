import { AgentChat } from "@/app/_components/agent-chat";
import { AppShell } from "@/components/zeke/app-shell";

export default async function SessionPage({
  params,
}: {
  readonly params: Promise<{ readonly sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <AppShell>
      <AgentChat sessionId={sessionId} />
    </AppShell>
  );
}
