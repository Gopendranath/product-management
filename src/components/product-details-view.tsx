"use client";

import { STOCK_BADGE_CLASS } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { DetailsIdKind } from "@/app/products/[id]/page";
import { productById } from "@/services/client";
import { useFavs } from "@/store/favs-context";
import { useFilters } from "@/store/filter-context";
import { useLocalProducts } from "@/store/local-products-context";
import { useToasts } from "@/store/toast-context";
import { ApiError } from "@/types/api-error";
import type { Product } from "@/types/product";
import {
  STOCK_LABEL,
  formatPrice,
  formatRating,
  stockStatus,
} from "@/utils/format";
import { ArrowLeft, Heart, Star } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Status = "loading" | "ready" | "empty";

interface ProductDetailsViewProps {
  rawId: string;
  idKind: DetailsIdKind;
  numericId: number | null;
  serverProduct: Product | null;
}

export function ProductDetailsView({
  rawId,
  idKind,
  numericId,
  serverProduct,
}: ProductDetailsViewProps): React.JSX.Element {
  const router = useRouter();
  const { pushToast } = useToasts();
  const { favIds, toggleFav } = useFavs();
  const { localProducts } = useLocalProducts();
  const { setFilter, resetFilters } = useFilters();

  const [product, setProduct] = useState<Product | null>(serverProduct);
  const [status, setStatus] = useState<Status>(
    serverProduct ? "ready" : idKind === "invalid" ? "empty" : "loading",
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [retryToken, setRetryToken] = useState(0);
  const resolvedRef = useRef(serverProduct !== null);
  const backRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryToken intentionally retriggers refetch
  useEffect(() => {
    if (
      resolvedRef.current ||
      serverProduct ||
      idKind === "invalid" ||
      numericId === null
    )
      return;
    const local = localProducts.find((item) => item.id === numericId);
    if (local) {
      resolvedRef.current = true;
      setProduct(local);
      setStatus("ready");
      return;
    }
    // Temp ids live in memory only; missing means gone.
    if (idKind === "temp") {
      resolvedRef.current = true;
      setStatus("empty");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    productById(numericId)
      .then((found) => {
        if (cancelled) return;
        resolvedRef.current = true;
        setProduct(found);
        setSelectedImage(0);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        resolvedRef.current = true;
        setStatus("empty");
        if (error instanceof ApiError && error.kind === "RETRYABLE") {
          pushToast("details-fetch", "error", "Could not load product.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serverProduct, idKind, numericId, localProducts, retryToken, pushToast]);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleCategory = (
    event: React.MouseEvent<HTMLAnchorElement>,
    category: string,
  ): void => {
    event.preventDefault();
    // Explicit overwrite: defaults first, then category (page resets to 1).
    resetFilters();
    setFilter({ category });
    router.push("/");
  };

  const handleRetry = (): void => {
    resolvedRef.current = false;
    setStatus("loading");
    setRetryToken((token) => token + 1);
  };

  if (status === "loading" || (status === "ready" && !product)) {
    return (
      <main className="container-app flex w-full flex-col gap-6 px-4 py-8">
        <Skeleton className="skeleton h-11 w-24" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="skeleton aspect-[16/10] w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="skeleton h-8 w-3/4" />
            <Skeleton className="skeleton h-4 w-full" />
            <Skeleton className="skeleton h-4 w-full" />
            <Skeleton className="skeleton h-6 w-1/3" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container-app flex w-full flex-col items-start gap-4 px-4 py-8">
        <Link
          ref={backRef}
          href="/"
          onClick={handleBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-sm px-2 text-sm font-medium"
        >
          <ArrowLeft aria-hidden />
          Back
        </Link>
        <div className="flex w-full flex-col items-center gap-3 rounded-lg border py-16 text-center">
          <p className="text-lg font-medium">Product not found</p>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            {idKind === "invalid"
              ? `“${rawId}” is not a valid product id.`
              : "It may have been removed or never existed."}
          </p>
          {idKind !== "invalid" && (
            <Button
              type="button"
              onClick={handleRetry}
              className="min-h-[44px]"
            >
              Retry
            </Button>
          )}
        </div>
      </main>
    );
  }

  const gallery = [
    ...new Set(
      product.images && product.images.length > 0
        ? product.images
        : [product.thumbnail],
    ),
  ];
  const mainSrc =
    gallery[Math.min(selectedImage, gallery.length - 1)] ?? product.thumbnail;
  const discount = product.discountPercentage ?? 0;
  const discounted = discount > 0 ? product.price * (1 - discount / 100) : null;
  const availability = stockStatus(product.stock);
  const isFav = favIds.includes(product.id);

  return (
    <main className="container-app flex w-full flex-col gap-6 px-4 py-8">
      <Link
        ref={backRef}
        href="/"
        onClick={handleBack}
        className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-sm px-2 text-sm font-medium"
      >
        <ArrowLeft aria-hidden />
        Back
      </Link>
      <article className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border">
            <ProductImage
              src={mainSrc}
              alt={product.title}
              seed={product.id}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-pressed={
                    index === Math.min(selectedImage, gallery.length - 1)
                  }
                  aria-label={`View image ${index + 1}`}
                  data-selected={
                    index === Math.min(selectedImage, gallery.length - 1)
                  }
                  className="relative h-16 w-16 overflow-hidden rounded-md border data-[selected=true]:border-accent"
                >
                  <ProductImage
                    src={src}
                    alt=""
                    seed={`${product.id}-${index}`}
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              onClick={(event) => handleCategory(event, product.category)}
              className="inline-flex min-h-[44px] items-center rounded-full"
            >
              <Badge variant="secondary">{product.category}</Badge>
            </Link>
            <Badge className={STOCK_BADGE_CLASS[availability]}>
              {STOCK_LABEL[availability]}
            </Badge>
            {discount > 0 && (
              <Badge className="bg-accent text-white">
                -{discount.toFixed(0)}%
              </Badge>
            )}
          </div>
          <h1 className="text-3xl tracking-tight md:text-4xl">
            {product.title}
          </h1>
          <p className="max-w-[65ch] text-base leading-relaxed">
            {product.description}
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            {discounted !== null ? (
              <>
                <span className="font-mono text-2xl tabular-nums">
                  {formatPrice(discounted)}
                </span>
                <span className="font-mono text-base tabular-nums text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-mono text-2xl tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star weight="fill" aria-hidden />
              {formatRating(product.rating)}
            </span>
          </div>
          <Separator />
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-muted-foreground">Brand</dt>
              <dd>{product.brand || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-muted-foreground">Stock</dt>
              <dd className="font-mono tabular-nums">{product.stock}</dd>
            </div>
            {product.sku && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted-foreground">SKU</dt>
                <dd className="font-mono">{product.sku}</dd>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted-foreground">Tags</dt>
                <dd>{product.tags.join(", ")}</dd>
              </div>
            )}
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              aria-pressed={isFav}
              onClick={() => toggleFav(product.id)}
              className="min-h-[44px]"
            >
              <Heart
                weight={isFav ? "fill" : "regular"}
                data-icon="inline-start"
              />
              Save
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
}
