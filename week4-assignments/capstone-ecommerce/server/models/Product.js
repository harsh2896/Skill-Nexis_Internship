const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true, maxlength: [120, "Name is too long (max 120)"] },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    image: { type: String, trim: true, default: "" }, // image URL
    category: { type: String, trim: true, default: "General" },
    stock: {
      type: Number, default: 0, min: [0, "Stock cannot be negative"],
      validate: { validator: Number.isInteger, message: "Stock must be a whole number" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
