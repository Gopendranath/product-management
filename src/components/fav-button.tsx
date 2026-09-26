"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "@phosphor-icons/react";

interface FavButtonProps {
  isFav: boolean;
  onToggle: () => void;
  className?: string;
}

/** Favourite toggle. Visible label on details, icon-only in cards/rows. */
export function FavButton({
  isFav,
  onToggle,
  className,
}: FavButtonProps): React.JSX.Element {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Save"
      aria-pressed={isFav}
      onClick={onToggle}
      className={`min-h-[44px] min-w-[44px] ${className ?? ""}`}
    >
      <Heart weight={isFav ? "fill" : "regular"} />
    </Button>
  );
}
