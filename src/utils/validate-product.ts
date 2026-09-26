/** Add-form validation. Pure. Values stay strings; numbers parse here. */
import type { AddProductPayload } from "@/types/product";

export type AddFieldKey =
  | "title"
  | "description"
  | "category"
  | "price"
  | "stock"
  | "brand"
  | "thumbnail";

export const ADD_FIELD_ORDER: readonly AddFieldKey[] = [
  "title",
  "description",
  "category",
  "price",
  "stock",
  "brand",
  "thumbnail",
];

export interface AddFormValues {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  thumbnail: string;
}

export const EMPTY_ADD_FORM: AddFormValues = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  brand: "",
  thumbnail: "",
};

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Single-field rule. Returns the inline message or null when valid. */
export function validateAddField(
  key: AddFieldKey,
  values: AddFormValues,
  categories: readonly string[],
): string | null {
  switch (key) {
    case "title": {
      const length = values.title.trim().length;
      if (length < 3) return "Title needs at least 3 characters.";
      if (length > 120) return "Title needs at most 120 characters.";
      return null;
    }
    case "description": {
      if (values.description.trim().length < 10)
        return "Description needs at least 10 characters.";
      return null;
    }
    case "category": {
      if (!values.category) return "Choose a category.";
      if (!categories.includes(values.category.toLowerCase()))
        return "Unknown category.";
      return null;
    }
    case "price": {
      const price = Number(values.price);
      if (values.price.trim() === "" || !Number.isFinite(price))
        return "Enter a valid price.";
      if (price <= 0) return "Price must be above 0.";
      if (price > 999999) return "Price must be at most 999999.";
      return null;
    }
    case "stock": {
      const stock = Number(values.stock);
      if (values.stock.trim() === "" || !Number.isFinite(stock))
        return "Enter a valid stock quantity.";
      if (!Number.isInteger(stock)) return "Stock must be a whole number.";
      if (stock < 0) return "Stock cannot be negative.";
      return null;
    }
    case "brand":
      return null;
    case "thumbnail": {
      if (!values.thumbnail.trim()) return null;
      if (!isHttpUrl(values.thumbnail))
        return "Thumbnail must be an http(s) URL.";
      return null;
    }
  }
}

export type AddFormErrors = Partial<Record<AddFieldKey, string>>;

/** All-field validation for submit. */
export function validateAddForm(
  values: AddFormValues,
  categories: readonly string[],
): AddFormErrors {
  const errors: AddFormErrors = {};
  for (const key of ADD_FIELD_ORDER) {
    const message = validateAddField(key, values, categories);
    if (message) errors[key] = message;
  }
  return errors;
}

/** Builds the POST payload. Call only after validateAddForm passes. */
export function toAddPayload(values: AddFormValues): AddProductPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim().toLowerCase(),
    price: Number(values.price),
    stock: Number(values.stock),
    brand: values.brand.trim(),
    thumbnail: values.thumbnail.trim() || undefined,
  };
}
