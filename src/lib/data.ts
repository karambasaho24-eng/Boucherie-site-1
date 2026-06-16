import { getDb } from "./db";
import { Category, Order, OrderItem, Product, Review } from "./types";

export function getSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

export function updateSetting(key: string, value: string) {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

export function getCategories(): Category[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
    .all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as
      | Category
      | undefined) ?? null
  );
}

export function getProducts(opts?: {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  recent?: boolean;
  inStockOnly?: boolean;
}): Product[] {
  const db = getDb();
  const where: string[] = [];
  const params: any[] = [];

  if (opts?.categorySlug) {
    where.push("c.slug = ?");
    params.push(opts.categorySlug);
  }
  if (opts?.search) {
    where.push("(p.name LIKE ? OR p.description LIKE ?)");
    params.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  if (opts?.featured) where.push("p.is_featured = 1");
  if (opts?.recent) where.push("p.is_recent = 1");
  if (opts?.inStockOnly) where.push("p.in_stock = 1");

  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY p.is_featured DESC, p.created_at DESC
  `;
  return db.prepare(sql).all(...params) as Product[];
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDb();
  return (
    (db
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ?`
      )
      .get(slug) as Product | undefined) ?? null
  );
}

export function getProductById(id: number): Product | null {
  const db = getDb();
  return (
    (db
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
      )
      .get(id) as Product | undefined) ?? null
  );
}

export function incrementProductViews(id: number) {
  const db = getDb();
  db.prepare("UPDATE products SET views = views + 1 WHERE id = ?").run(id);
}

export function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  promo_price: number | null;
  category_id: number | null;
  image: string | null;
  in_stock: number;
  is_featured: number;
  is_recent: number;
}) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO products
     (name, slug, description, price, promo_price, category_id, image, in_stock, is_featured, is_recent, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  );
  const info = stmt.run(
    data.name,
    data.slug,
    data.description,
    data.price,
    data.promo_price,
    data.category_id,
    data.image,
    data.in_stock,
    data.is_featured,
    data.is_recent
  );
  return info.lastInsertRowid as number;
}

export function updateProduct(
  id: number,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    promo_price?: number | null;
    category_id?: number | null;
    image?: string | null;
    in_stock?: number;
    is_featured?: number;
    is_recent?: number;
  }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return;
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );
}

export function deleteProduct(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function getReviews(): Review[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC LIMIT 30"
    )
    .all() as Review[];
}

export function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  notes?: string;
  items: { product_id: number; product_name: string; unit_price: number; quantity: number }[];
  total: number;
}): number {
  const db = getDb();
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO orders
         (customer_name, customer_phone, customer_email, customer_address, notes, total, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`
      )
      .run(
        data.customer_name,
        data.customer_phone,
        data.customer_email ?? null,
        data.customer_address ?? null,
        data.notes ?? null,
        data.total
      );
    const orderId = info.lastInsertRowid as number;
    const itemStmt = db.prepare(
      `INSERT INTO order_items
       (order_id, product_id, product_name, unit_price, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    for (const it of data.items) {
      itemStmt.run(orderId, it.product_id, it.product_name, it.unit_price, it.quantity);
    }
    return orderId;
  });
  return tx();
}

export function getOrders(): Order[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200")
    .all() as Order[];
}

export function getOrderById(id: number): Order | null {
  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order) return null;
  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(id) as OrderItem[];
  return { ...order, items };
}

export function updateOrderStatus(id: number, status: string) {
  const db = getDb();
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

export function getStats() {
  const db = getDb();
  const totalProducts = (db.prepare("SELECT COUNT(*) AS c FROM products").get() as any)
    .c;
  const totalOrders = (db.prepare("SELECT COUNT(*) AS c FROM orders").get() as any)
    .c;
  const pendingOrders = (db.prepare(
    "SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'"
  ).get() as any).c;
  const revenue = (db
    .prepare("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE status != 'cancelled'")
    .get() as any).s;
  const top = db
    .prepare(
      `SELECT p.id, p.name, p.image, SUM(oi.quantity) AS qty
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY qty DESC
       LIMIT 5`
    )
    .all();
  return { totalProducts, totalOrders, pendingOrders, revenue, top };
}
