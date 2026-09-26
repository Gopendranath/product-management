import { ProductDetailsView } from "@/components/product-details-view";
import { productById } from "@/services/client";
import type { Product } from "@/types/product";

export type DetailsIdKind = "invalid" | "temp" | "server";

function parseId(raw: string): {
  kind: DetailsIdKind;
  numericId: number | null;
} {
  const id = Number(raw);
  if (!Number.isInteger(id)) return { kind: "invalid", numericId: null };
  if (id < 0) return { kind: "temp", numericId: id };
  if (id < 1) return { kind: "invalid", numericId: null };
  return { kind: "server", numericId: id };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id: raw } = await params;
  const { kind, numericId } = parseId(raw);
  // SSR prefetch for server ids. Temp ids skip the network entirely;
  // invalid ids never fetch. Client refetches when SSR misses.
  let serverProduct: Product | null = null;
  if (kind === "server" && numericId !== null) {
    try {
      serverProduct = await productById(numericId);
    } catch {
      serverProduct = null;
    }
  }
  return (
    <ProductDetailsView
      rawId={raw}
      idKind={kind}
      numericId={numericId}
      serverProduct={serverProduct}
    />
  );
}
