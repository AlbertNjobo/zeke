import { AgentChat } from "@/app/_components/agent-chat";
import { AppShell } from "@/components/zeke/app-shell";

/** Live chat with the eve agent. Home's message box lands here with ?q= set. */
export default async function NewSessionPage({ searchParams }: { readonly searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <AppShell zekeState="thinking">
      <AgentChat sessionless initialPrompt={q} />
    </AppShell>
  );
}
