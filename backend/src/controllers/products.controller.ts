import { Request, Response } from "express";
import { db } from "../db";
import { products, categories, reviews } from "../db/schema";
import { eq, like, and, gte, lte, desc, asc, or, sql, ilike } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    page = "1",
    limit = "12",
    category,
    search,
    minPrice,
    maxPrice,
    sort = "createdAt",
    order = "desc",
    featured,
    brand,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(products.isActive, true)];

  if (category) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`),
        ilike(products.brand, `%${search}%`)
      )!
    );
  }

  if (minPrice) conditions.push(gte(products.price, minPrice));
  if (maxPrice) conditions.push(lte(products.price, maxPrice));
  if (featured === "true") conditions.push(eq(products.isFeatured, true));
  if (brand) conditions.push(ilike(products.brand, `%${brand}%`));

  const sortMap: Record<string, any> = {
    createdAt: products.createdAt,
    price: products.price,
    rating: products.rating,
    name: products.name,
  };
  const sortCol = sortMap[sort] ?? products.createdAt;
  const orderFn = order === "asc" ? asc : desc;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        price: products.price,
        comparePrice: products.comparePrice,
        images: products.images,
        rating: products.rating,
        reviewCount: products.reviewCount,
        stock: products.stock,
        isFeatured: products.isFeatured,
        brand: products.brand,
        tags: products.tags,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(orderFn(sortCol))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions)),
  ]);

  res.json({
    success: true,
    data: {
      products: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        pages: Math.ceil(Number(count) / limitNum),
      },
    },
  });
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) throw new AppError(404, "Product not found");

  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, product.id))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  res.json({ success: true, data: { product, reviews: productReviews } });
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  const featured = await db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);

  res.json({ success: true, data: { products: featured } });
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const cats = await db.select().from(categories).orderBy(asc(categories.name));
  res.json({ success: true, data: { categories: cats } });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, imageUrl, parentId } = req.body;
  if (!name || !slug) throw new AppError(400, "Name and slug are required");

  // check for duplicate slug
  const [existing] = await db.select({ id: categories.id }).from(categories)
    .where(eq(categories.slug, slug)).limit(1);
  if (existing) throw new AppError(409, "A category with this slug already exists");

  const [category] = await db.insert(categories)
    .values({ name, slug, description: description || null, imageUrl: imageUrl || null, parentId: parentId || null })
    .returning();

  res.status(201).json({ success: true, data: { category } });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, slug, description, imageUrl, parentId } = req.body;

  if (slug) {
    const [conflict] = await db.select({ id: categories.id }).from(categories)
      .where(eq(categories.slug, slug)).limit(1);
    if (conflict && conflict.id !== id) throw new AppError(409, "Slug already in use");
  }

  const [category] = await db.update(categories)
    .set({
      ...(name        !== undefined && { name }),
      ...(slug        !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(imageUrl    !== undefined && { imageUrl }),
      ...(parentId    !== undefined && { parentId }),
    })
    .where(eq(categories.id, id))
    .returning();

  if (!category) throw new AppError(404, "Category not found");
  res.json({ success: true, data: { category } });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  // Nullify categoryId on products that use this category before deleting
  await db.update(products).set({ categoryId: null } as any).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  res.json({ success: true, message: "Category deleted" });
};

// ── Admin CRUD ────────────────────────────────────────────────────────────────

/** Convert empty strings to null so the DB doesn't choke on "" for UUID/decimal fields */
function sanitize(data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v === "" ? null : v;
  }
  return out;
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const raw = req.body;
  const data = sanitize(raw);
  const slug = String(data.name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const [product] = await db
    .insert(products)
    .values({ ...data, slug } as any)
    .returning();

  res.status(201).json({ success: true, data: { product } });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const raw = req.body;
  const updates = sanitize(raw);

  if (updates.name) {
    updates.slug = String(updates.name)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const [product] = await db
    .update(products)
    .set({ ...(updates as any), updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  if (!product) throw new AppError(404, "Product not found");
  res.json({ success: true, data: { product } });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  res.json({ success: true, message: "Product deleted successfully" });
};

export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  const { page = "1", limit = "20", search } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  const conditions = search ? [ilike(products.name, `%${search}%`)] : [];

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  res.json({
    success: true,
    data: {
      products: rows,
      pagination: { page: pageNum, limit: limitNum, total: Number(count) },
    },
  });
};
