export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  category_id: number | null;
  image: string | null;
  in_stock: number;
  is_featured: number;
  is_recent: number;
  views: number;
  created_at: string;
  category_name?: string;
  category_slug?: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export type Review = {
  id: number;
  author: string;
  rating: number;
  content: string;
  created_at: string;
};

export type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  notes: string | null;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
};
