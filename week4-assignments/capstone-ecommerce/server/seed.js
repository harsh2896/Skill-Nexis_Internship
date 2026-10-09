// Creates the admin account and some sample products.  Run: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");

const products = [
  { name: "Wireless Earbuds", description: "Bluetooth 5.3 earbuds with charging case and 20 hour battery.", price: 1499, stock: 25, category: "Electronics" },
  { name: "Smart Watch", description: "Fitness tracker with heart-rate monitor and sleep tracking.", price: 2999, stock: 15, category: "Electronics" },
  { name: "Power Bank 10000mAh", description: "Slim fast-charging power bank with two USB ports.", price: 999, stock: 40, category: "Electronics" },
  { name: "Cotton T-Shirt", description: "Soft round-neck cotton t-shirt, regular fit.", price: 499, stock: 60, category: "Fashion" },
  { name: "Denim Jacket", description: "Classic blue denim jacket with button closure.", price: 1899, stock: 12, category: "Fashion" },
  { name: "Running Shoes", description: "Lightweight breathable running shoes with cushioned sole.", price: 2199, stock: 20, category: "Fashion" },
  { name: "Ceramic Coffee Mug", description: "350 ml microwave-safe ceramic mug.", price: 249, stock: 80, category: "Home" },
  { name: "LED Desk Lamp", description: "Adjustable desk lamp with three brightness levels.", price: 799, stock: 30, category: "Home" },
  { name: "JavaScript: The Good Parts", description: "A short book on the best features of JavaScript.", price: 599, stock: 18, category: "Books" },
  { name: "Clean Code", description: "A handbook of agile software craftsmanship.", price: 899, stock: 10, category: "Books" },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  let admin = await User.findOne({ email });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log(`Existing user ${email} is now an admin`);
  } else {
    await User.create({ name: "Admin", email, password, role: "admin" });
    console.log(`Admin created: ${email}`);
  }
  if (!process.env.ADMIN_PASSWORD) console.warn("ADMIN_PASSWORD not set, using a default password. Change it before deploying.");

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(products);
    console.log(`${products.length} sample products added`);
  } else {
    console.log("Products already exist, skipping sample products");
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
