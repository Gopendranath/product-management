"use client";

import { Badge } from "@/components/ui/badge";
import { FavButton } from "@/components/fav-button";
import { STOCK_BADGE_CLASS } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Product } from "@/types/product";
import {
  STOCK_LABEL,
  formatPrice,
  formatRating,
  stockStatus,
} from "@/utils/format";
import { Star } from "@phosphor-icons/react";
import Link from "next/link";
import { memo } from "react";

interface ProductRowProps {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: number) => void;
}

export const ProductRow = memo(function ProductRow({
  product,
  isFav,
  onToggleFav,
}: ProductRowProps): React.JSX.Element {
  const status = stockStatus(product.stock);
  return (
    <TableRow>
      <TableCell>
        <div className="relative h-16 w-16 overflow-hidden rounded-md">
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            seed={product.id}
            sizes="64px"
            className="object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell>
        <Badge variant="secondary">{product.category}</Badge>
      </TableCell>
      <TableCell className="font-mono tabular-nums">
        {formatPrice(product.price)}
      </TableCell>
      <TableCell>
        <Badge className={STOCK_BADGE_CLASS[status]}>
          {STOCK_LABEL[status]}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star weight="fill" aria-hidden />
          {formatRating(product.rating)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <FavButton isFav={isFav} onToggle={() => onToggleFav(product.id)} />
          <Link
            href={`/products/${product.id}`}
            className="inline-flex min-h-[44px] items-center rounded-sm px-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            View Details
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
});
