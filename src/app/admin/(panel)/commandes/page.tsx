import { getOrders } from "@/lib/data";
import OrdersAdmin from "./OrdersAdmin";

export const dynamic = "force-dynamic";

export default function CommandesPage() {
  const orders = getOrders();
  return <OrdersAdmin initialOrders={orders} />;
}
