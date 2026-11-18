import type { StockItem } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

/** On-hand level against the reorder point. Low stock fills in Zeke's colour. */
export function StockBar({ item }: { item: StockItem }) {
  const low = item.onHand < item.reorderPoint;
  const fill = Math.min(100, (item.onHand / item.capacity) * 100);
  const mark = Math.min(100, (item.reorderPoint / item.capacity) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-body-medium">
        <span className={low ? "font-medium" : undefined}>{item.name}</span>
        <span className={cx("font-mono", low ? "text-accent-700" : "text-text-secondary")}>
          {item.onHand} / {item.reorderPoint}
        </span>
      </div>
      <div
        className="relative h-1.5 rounded-full bg-background-tertiary-default"
        role="meter"
        aria-label={`${item.name}: ${item.onHand} ${item.unit} on hand, reorder at ${item.reorderPoint}`}
        aria-valuemin={0}
        aria-valuemax={item.capacity}
        aria-valuenow={item.onHand}
      >
        <span className={cx("absolute inset-y-0 start-0 rounded-full", low ? "bg-accent-500" : "bg-text-primary")} style={{ width: `${fill}%` }} />
        <span className="absolute -inset-y-1 w-0.5 bg-text-primary" style={{ insetInlineStart: `${mark}%` }} aria-hidden />
      </div>
    </div>
  );
}
