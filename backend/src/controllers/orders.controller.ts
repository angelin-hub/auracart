import { Request, Response } from "express";
import { db } from "../db";
import { orders, orderItems, cartItems, carts, products, users } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

type AuthReq = Request & { user?: any };

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `AC-${timestamp}-${random}`;
};

export const createOrder = async (req: AuthReq, res: Response): Promise<void> => {
  const { shippingAddress, notes } = req.body;

  // Get user cart
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, req.user.id))
    .limit(1);

  if (!cart) throw new AppError(400, "Cart not found");

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        images: products.images,
        stock: products.stock,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  if (items.length === 0) throw new AppError(400, "Cart is empty");

  // Validate stock
  for (const item of items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${item.product.name}`);
    }
  }

  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.product.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const orderNumber = generateOrderNumber();
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: req.user.id,
      status: "confirmed",
      paymentStatus: "paid",
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      shippingAddress,
      notes,
      estimatedDelivery,
    })
    .returning();

  // Insert order items
  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.product.id,
      productName: item.product.name,
      productImage: (item.product.images as string[])[0] || null,
      price: item.product.price,
      quantity: item.quantity,
      total: (parseFloat(item.product.price) * item.quantity).toFixed(2),
    }))
  );

  // Update stock
  for (const item of items) {
    await db
      .update(products)
      .set({ stock: item.product.stock - item.quantity })
      .where(eq(products.id, item.product.id));
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order: { ...order, items } },
  });
};

export const getUserOrders = async (req: AuthReq, res: Response): Promise<void> => {
  const { page = "1", limit = "10" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const [userOrders, [{ count }]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, req.user.id)),
  ]);

  // Attach items to each order
  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  res.json({
    success: true,
    data: {
      orders: ordersWithItems,
      pagination: { page: pageNum, limit: limitNum, total: Number(count) },
    },
  });
};

export const getOrderById = async (req: AuthReq, res: Response): Promise<void> => {
  const { id } = req.params;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      req.user.role === "admin"
        ? eq(orders.id, id)
        : and(eq(orders.id, id), eq(orders.userId, req.user.id))
    )
    .limit(1);

  if (!order) throw new AppError(404, "Order not found");

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  res.json({ success: true, data: { order: { ...order, items } } });
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllOrders = async (req: AuthReq, res: Response): Promise<void> => {
  const { page = "1", limit = "20", status } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const conditions = status ? [eq(orders.status, status as any)] : [];

  const [allOrders, [{ count }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        createdAt: orders.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  res.json({
    success: true,
    data: {
      orders: allOrders,
      pagination: { page: pageNum, limit: limitNum, total: Number(count) },
    },
  });
};

export const updateOrderStatus = async (req: AuthReq, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const [order] = await db
    .update(orders)
    .set({ status, trackingNumber, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  if (!order) throw new AppError(404, "Order not found");
  res.json({ success: true, data: { order } });
};

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
    db
      .select({ sum: sql<number>`COALESCE(SUM(CAST(total AS DECIMAL)), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid")),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(products),
  ]);

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  res.json({
    success: true,
    data: {
      stats: {
        totalRevenue: Number(totalRevenue[0]?.sum) || 0,
        totalOrders: Number(totalOrders[0]?.count) || 0,
        totalUsers: Number(totalUsers[0]?.count) || 0,
        totalProducts: Number(totalProducts[0]?.count) || 0,
      },
      recentOrders,
    },
  });
};
