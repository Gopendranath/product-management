"use client";

import { ProductImage } from "@/components/product-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addProduct } from "@/services/client";
import { useFilters } from "@/store/filter-context";
import { useLocalProducts } from "@/store/local-products-context";
import { useToasts } from "@/store/toast-context";
import { ApiError } from "@/types/api-error";
import {
  ADD_FIELD_ORDER,
  EMPTY_ADD_FORM,
  toAddPayload,
  validateAddField,
  validateAddForm,
  type AddFieldKey,
  type AddFormErrors,
  type AddFormValues,
} from "@/utils/validate-product";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}): React.JSX.Element | null {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-error-text">
      {message}
    </p>
  );
}

export function ProductAddForm({
  categories,
}: {
  categories: string[];
}): React.JSX.Element {
  const router = useRouter();
  const { pushToast } = useToasts();
  const { addLocal } = useLocalProducts();
  const { resetFilters } = useFilters();

  const [values, setValues] = useState<AddFormValues>(EMPTY_ADD_FORM);
  const [errors, setErrors] = useState<AddFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const fieldRefs = useRef<Record<AddFieldKey, HTMLElement | null>>({
    title: null,
    description: null,
    category: null,
    price: null,
    stock: null,
    brand: null,
    thumbnail: null,
  });

  const dirty = ADD_FIELD_ORDER.some((key) => values[key] !== "");
  const thumbnailValid =
    values.thumbnail.trim() !== "" &&
    !validateAddField("thumbnail", values, categories);
  const thumbnailError = errors.thumbnail;

  const setValue = (key: AddFieldKey, value: string): void => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const blurField = (key: AddFieldKey): void => {
    setErrors((previous) => ({
      ...previous,
      [key]: validateAddField(key, values, categories) ?? undefined,
    }));
  };

  const focusFirstError = (next: AddFormErrors): void => {
    const first = ADD_FIELD_ORDER.find((key) => next[key]);
    if (first) fieldRefs.current[first]?.focus();
  };

  const handleReset = (): void => {
    setValues(EMPTY_ADD_FORM);
    setErrors({});
    setFormError(null);
  };

  const handleCancel = (confirmed: boolean): void => {
    if (!confirmed) return;
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (pendingRef.current) return;
    const next = validateAddForm(values, categories);
    setErrors(next);
    setFormError(null);
    const first = ADD_FIELD_ORDER.find((key) => next[key]);
    if (first) {
      focusFirstError(next);
      return;
    }
    pendingRef.current = true;
    setPending(true);
    const payload = toAddPayload(values);
    addProduct(payload)
      .then(() => {
        // Mock id ignored; temp id assigned locally for session visibility.
        addLocal(payload);
        pushToast("add-submit", "success", "Product added.");
        resetFilters();
        router.push("/");
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.kind === "RETRYABLE") {
          setFormError(
            "Could not save the product. Check your connection and retry.",
          );
          pushToast("add-submit", "error", "Could not save the product.");
        } else if (error instanceof ApiError) {
          setFormError(error.message);
          pushToast("add-submit", "error", "Could not save the product.");
        } else {
          setFormError("Could not save the product.");
        }
      })
      .finally(() => {
        pendingRef.current = false;
        setPending(false);
      });
  };

  const describedBy = (key: AddFieldKey): string | undefined =>
    errors[key] ? `${key}-error` : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-title">Title</Label>
        <Input
          id="add-title"
          ref={(element) => {
            fieldRefs.current.title = element;
          }}
          type="text"
          value={values.title}
          onChange={(event) => setValue("title", event.target.value)}
          onBlur={() => blurField("title")}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describedBy("title")}
          autoComplete="off"
          className="min-h-[44px]"
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-description">Description</Label>
        <Textarea
          id="add-description"
          ref={(element) => {
            fieldRefs.current.description = element;
          }}
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
          onBlur={() => blurField("description")}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={describedBy("description")}
          rows={4}
          className="min-h-[44px]"
        />
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-category">Category</Label>
          <Select
            value={values.category}
            onValueChange={(value) => {
              if (value) setValue("category", value);
            }}
          >
            <SelectTrigger
              id="add-category"
              ref={(element) => {
                fieldRefs.current.category = element;
              }}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={describedBy("category")}
              onBlur={() => blurField("category")}
              className="min-h-[44px] w-full"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="category-error" message={errors.category} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-brand">Brand (optional)</Label>
          <Input
            id="add-brand"
            ref={(element) => {
              fieldRefs.current.brand = element;
            }}
            type="text"
            value={values.brand}
            onChange={(event) => setValue("brand", event.target.value)}
            autoComplete="off"
            className="min-h-[44px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-price">Price (USD)</Label>
          <Input
            id="add-price"
            ref={(element) => {
              fieldRefs.current.price = element;
            }}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={values.price}
            onChange={(event) => setValue("price", event.target.value)}
            onBlur={() => blurField("price")}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={describedBy("price")}
            className="min-h-[44px] font-mono tabular-nums"
          />
          <FieldError id="price-error" message={errors.price} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-stock">Stock quantity</Label>
          <Input
            id="add-stock"
            ref={(element) => {
              fieldRefs.current.stock = element;
            }}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={values.stock}
            onChange={(event) => setValue("stock", event.target.value)}
            onBlur={() => blurField("stock")}
            aria-invalid={Boolean(errors.stock)}
            aria-describedby={describedBy("stock")}
            className="min-h-[44px] font-mono tabular-nums"
          />
          <FieldError id="stock-error" message={errors.stock} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-thumbnail">Thumbnail URL (optional)</Label>
        <Input
          id="add-thumbnail"
          ref={(element) => {
            fieldRefs.current.thumbnail = element;
          }}
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={values.thumbnail}
          onChange={(event) => setValue("thumbnail", event.target.value)}
          onBlur={() => blurField("thumbnail")}
          aria-invalid={Boolean(thumbnailError)}
          aria-describedby={
            thumbnailError ? "thumbnail-error" : "thumbnail-hint"
          }
          autoComplete="off"
          className="min-h-[44px]"
        />
        {!thumbnailError && (
          <p id="thumbnail-hint" className="text-sm text-muted-foreground">
            Public http(s) image. Broken images fall back to a placeholder.
          </p>
        )}
        <FieldError id="thumbnail-error" message={thumbnailError} />
        {thumbnailValid && (
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
            <ProductImage
              src={values.thumbnail.trim()}
              alt="Thumbnail preview"
              seed="preview"
              sizes="(max-width: 640px) 100vw, 24rem"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-lg bg-error px-4 py-3 text-sm text-error-text"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="min-h-[44px]">
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="min-h-[44px]"
        >
          Reset
        </Button>
        {dirty ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="ghost" className="min-h-[44px]">
                  Cancel
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard this product?</AlertDialogTitle>
                <AlertDialogDescription>
                  Unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleCancel(true)}>
                  Discard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleCancel(true)}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
