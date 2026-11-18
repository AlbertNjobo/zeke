import { notFound } from "next/navigation";
import { AppShell } from "@/components/zeke/app-shell";
import { RestockConversation } from "@/components/zeke/restock-conversation";
import { getState } from "@/lib/zeke/server";
import { itemById, threadView } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = await getState();
  const restock = state.restocks.find((r) => r.id === id);
  if (!restock) notFound();

  const suppliers = state.suppliers.filter((s) => restock.supplierIds.includes(s.id) || s.id === restock.block?.supplierId);

  return (
    <AppShell zekeState={threadView(state, restock).face}>
      <RestockConversation restock={restock} item={itemById(state, restock.itemId)} suppliers={suppliers} company={state.company} />
    </AppShell>
  );
}
