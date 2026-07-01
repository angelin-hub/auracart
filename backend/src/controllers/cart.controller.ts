import { Request, Response } from "express";
import { db } from "../db";
import { carts, cartItems, products } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

type AuthReq = Request & { user?: any };

const getUserCart = async (userId: string) => {
  let [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    [cart] = await db.insert(carts).values({ userId }).returning();
  }
  return cart;
};

export const getCart = async (req: AuthReq, res: Response): Promise<void> => {
  const cart = await getUserCart(req.user.id);

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      addedAt: cartItems.addedAt,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        comparePrice: products.comparePrice,
        images: products.images,
        stock: products.stock,
        brand: products.brand,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.product.price) * item.quantity,
    0
  );

  res.json({ success: true, data: { cart: { ...cart, items, subtotal } } });
};

export const addToCart = async (req: AuthReq, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;

  const [product] = await db
    .select({ id: products.id, stock: products.stock, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || !product.isActive) throw new AppError(404, "Product not found");
  if (product.stock < quantity) throw new AppError(400, "Insufficient stock");

  const cart = await getUserCart(req.user.id);

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (product.stock < newQty) throw new AppError(400, "Insufficient stock");

    await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
  }

  res.json({ success: true, message: "Item added to cart" });
};

export const updateCartItem = async (req: AuthReq, res: Response): Promise<void> => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await getUserCart(req.user.id);

  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
    .limit(1);

  if (!item) throw new AppError(404, "Cart item not found");

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }

  res.json({ success: true, message: "Cart updated" });
};

export const removeFromCart = async (req: AuthReq, res: Response): Promise<void> => {
  const { itemId } = req.params;
  const cart = await getUserCart(req.user.id);

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));

  res.json({ success: true, message: "Item removed from cart" });
};

export const clearCart = async (req: AuthReq, res: Response): Promise<void> => {
  const cart = await getUserCart(req.user.id);
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  res.json({ success: true, message: "Cart cleared" });
};
