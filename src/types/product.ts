/** Strict DummyJSON product models. No `any`. */

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  /** 0 when absent upstream. */
  discountPercentage?: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images?: string[];
  tags?: string[];
  sku?: string;
}

export interface PaginatedProducts {
  /** Raw server page. No local merge here (listing owns that). */
  products: Product[];
  /** Server total. Excludes locals; display total computed by listing. */
  total: number;
  skip: number;
  limit: number;
}

export interface AddProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
  thumbnail?: string;
}
