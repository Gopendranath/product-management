"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FavButton } from "@/components/fav-button";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/types/product";
import {
  STOCK_BADGE_CLASS,
  STOCK_LABEL,
  formatPrice,
  formatRating,
  stockStatus,
} from "@/utils/format";
import { Star } from "@phosphor-icons/react";
import Link from "next/link";
import { memo } from "react";

/** Kept here for existing imports; canonical home is utils/format. */
export { STOCK_BADGE_CLASS } from "@/utils/format";

interface ProductCardProps {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: number) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  isFav,
  onToggleFav,
}: ProductCardProps): React.JSX.Element {
  const status = stockStatus(product.stock);
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full">
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          seed={product.id}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-base leading-snug font-medium text-balance">
            {product.title}
          </h3>
          <FavButton
            isFav={isFav}
            onToggle={() => onToggleFav(product.id)}
            className="shrink-0"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{product.category}</Badge>
          <Badge className={STOCK_BADGE_CLASS[status]}>
            {STOCK_LABEL[status]}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm tabular-nums">
            {formatPrice(product.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star weight="fill" aria-hidden />
            {formatRating(product.rating)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/products/${product.id}`} />}
          className="min-h-[44px] w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
});
