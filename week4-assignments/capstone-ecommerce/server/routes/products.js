const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();

const FIELDS = ["name", "description", "price", "image", "category", "stock"];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SORTS = { newest: { createdAt: -1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 }, name: { name: 1 } };

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=   (public)
router.get("/", asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), "i");
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (category) filter.category = category;
  const min = Number(minPrice), max = Number(maxPrice);
  if ((minPrice && Number.isFinite(min)) || (maxPrice && Number.isFinite(max))) {
    filter.price = {};
    if (minPrice && Number.isFinite(min)) filter.price.$gte = min;
    if (maxPrice && Number.isFinite(max)) filter.price.$lte = max;
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ products, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
}));

// GET /api/products/categories   (public)
router.get("/categories", asyncHandler(async (req, res) => {
  res.json((await Product.distinct("category")).sort());
}));

// GET /api/products/:id   (public)
router.get("/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  res.json(product);
}));

// Admin only below
router.post("/", protect, adminOnly, asyncHandler(async (req, res) => {
  res.status(201).json(await Product.create(pick(req.body)));
}));

router.put("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!product) throw httpError(404, "Product not found");
  res.json(product);
}));

router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  res.json({ message: "Product deleted", id: product._id });
}));

module.exports = router;
