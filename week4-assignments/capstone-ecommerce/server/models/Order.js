const mongoose = require("mongoose");

// A copy of the product details at purchase time, so old orders stay correct if a product changes later
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [itemSchema], validate: [(v) => v.length > 0, "Order must have at least one item"] },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    total: { type: Number, required: true },
    status: { type: String, enum: ["placed", "shipped", "delivered", "cancelled"], default: "placed" },
    paymentMethod: { type: String, default: "Cash on Delivery" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
