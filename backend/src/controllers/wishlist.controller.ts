import { Request, Response } from "express";
import { db } from "../db";
import { wishlists, products } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

type AuthReq = Request & { user?: any };

export const getWishlist = async (req: AuthReq, res: Response): Promise<void> => {
  const items = await db
    .select({
      id: wishlists.id,
      addedAt: wishlists.addedAt,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        comparePrice: products.comparePrice,
        images: products.images,
        rating: products.rating,
        stock: products.stock,
        brand: products.brand,
      },
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, req.user.id))
    .orderBy(wishlists.addedAt);

  res.json({ success: true, data: { wishlist: items } });
};

export const toggleWishlist = async (req: AuthReq, res: Response): Promise<void> => {
  const { productId } = req.body;

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) throw new AppError(404, "Product not found");

  const [existing] = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, req.user.id), eq(wishlists.productId, productId)))
    .limit(1);

  if (existing) {
    await db.delete(wishlists).where(eq(wishlists.id, existing.id));
    res.json({ success: true, message: "Removed from wishlist", inWishlist: false });
  } else {
    await db.insert(wishlists).values({ userId: req.user.id, productId });
    res.json({ success: true, message: "Added to wishlist", inWishlist: true });
  }
};

export const removeFromWishlist = async (req: AuthReq, res: Response): Promise<void> => {
  const { productId } = req.params;

  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, req.user.id), eq(wishlists.productId, productId)));

  res.json({ success: true, message: "Removed from wishlist" });
};
