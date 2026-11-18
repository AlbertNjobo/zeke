import { AppShell } from "@/components/zeke/app-shell";
import { StockBar } from "@/components/zeke/stock-bar";
import { getState } from "@/lib/zeke/server";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const stock = (await getState()).items;
  const low = stock.filter((i) => i.onHand < i.reorderPoint).length;
  return (
    <AppShell>
      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-display-4-semibold tracking-tight">Stock</h1>
          <span className="text-body-regular text-text-secondary">
            Zeke checks every day at 06:00 · <span className="text-accent-700">{low} below reorder point</span>
          </span>
        </div>
        <ul className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
          {stock.map((item, i) => (
            <li key={item.id} className={i > 0 ? "flex flex-col gap-1 border-t border-separator-border px-5 py-4" : "flex flex-col gap-1 px-5 py-4"}>
              <StockBar item={item} />
              <span className="font-mono text-caption-1-regular text-text-tertiary">
                {item.sku} · {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
