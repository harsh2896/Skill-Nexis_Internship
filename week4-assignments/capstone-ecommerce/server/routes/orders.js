const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();
router.use(protect);

const ADDRESS_FIELDS = ["fullName", "phone", "address", "city", "pincode"];
const STATUSES = ["placed", "shipped", "delivered", "cancelled"];

const restoreStock = (items) =>
  Promise.all(items.map((it) => Product.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } })));

// POST /api/orders   body: { items: [{ productId, quantity }], shippingAddress: {...} }
// Prices are read from the database, never trusted from the client.
router.post("/", asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, "Cart is empty");

  const addr = shippingAddress || {};
  for (const f of ADDRESS_FIELDS) {
    if (!String(addr[f] || "").trim()) throw httpError(400, `Shipping ${f} is required`);
  }

  // Merge duplicates and validate quantities
  const wanted = new Map();
  for (const it of items) {
    const qty = Number(it.quantity);
    if (!it.productId || !Number.isInteger(qty) || qty < 1 || qty > 20) throw httpError(400, "Invalid cart item");
    wanted.set(String(it.productId), (wanted.get(String(it.productId)) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
  if (products.length !== wanted.size) throw httpError(400, "One or more products no longer exist");

  const orderItems = products.map((p) => ({
    product: p._id, name: p.name, price: p.price, image: p.image, quantity: wanted.get(String(p._id)),
  }));

  // Reserve stock one product at a time; undo everything if anything fails
  const reserved = [];
  try {
    for (const it of orderItems) {
      const r = await Product.updateOne({ _id: it.product, stock: { $gte: it.quantity } }, { $inc: { stock: -it.quantity } });
      if (r.modifiedCount !== 1) throw httpError(400, `Not enough stock for ${it.name}`);
      reserved.push(it);
    }
    const total = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const shipping = Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, String(addr[f]).trim()]));
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress: shipping, total });
    return res.status(201).json(order);
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
}));

// GET /api/orders/mine - my orders
router.get("/mine", asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
}));

// PUT /api/orders/:id/cancel - customer cancels own order (only while "placed")
router.put("/:id/cancel", asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw httpError(404, "Order not found");
  if (order.status !== "placed") throw httpError(400, "Only orders that are not shipped yet can be cancelled");
  order.status = "cancelled";
  await order.save();
  await restoreStock(order.items);
  res.json(order);
}));

// GET /api/orders - all orders (admin)
router.get("/", adminOnly, asyncHandler(async (req, res) => {
  res.json(await Order.find().populate("user", "name email").sort({ createdAt: -1 }));
}));

// PUT /api/orders/:id/status - update status (admin)
router.put("/:id/status", adminOnly, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw httpError(400, `Status must be one of: ${STATUSES.join(", ")}`);

  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw httpError(404, "Order not found");
  if (order.status === "cancelled") throw httpError(400, "Cancelled orders cannot be changed");

  const wasCancelled = status === "cancelled";
  order.status = status;
  await order.save();
  if (wasCancelled) await restoreStock(order.items);
  res.json(order);
}));

module.exports = router;
