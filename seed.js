require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');
const products = [
  {
    "legacyId": 1,
    "name": "T-shirt with tape details",
    "price": 120,
    "oldPrice": null,
    "discount": null,
    "rating": 4.0,
    "image": "/images/black-t-shirt.png",
    "category": "T-shirts",
    "description": "T-shirt with tape details \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": true
  },
  {
    "legacyId": 2,
    "name": "Skinny Fit Jeans",
    "price": 240,
    "oldPrice": 260,
    "discount": "-20%",
    "rating": 3.5,
    "image": "/images/skinny-fit-jeans.png",
    "category": "Jeans",
    "description": "Skinny Fit Jeans \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": false
  },
  {
    "legacyId": 3,
    "name": "Checkered Shirt",
    "price": 180,
    "oldPrice": null,
    "discount": null,
    "rating": 4.5,
    "image": "/images/checkered-shirt.png",
    "category": "Shirts",
    "description": "Checkered Shirt \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": false
  },
  {
    "legacyId": 4,
    "name": "Sleeve Stripped T-shirt",
    "price": 130,
    "oldPrice": 160,
    "discount": "-30%",
    "rating": 4.5,
    "image": "/images/sleeve-stripped-t-shirt.png",
    "category": "T-shirts",
    "description": "Sleeve Stripped T-shirt \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": false
  },
  {
    "legacyId": 51,
    "name": "Vertical Striped Shirt",
    "price": 212,
    "oldPrice": 232,
    "discount": "-20%",
    "rating": 5.0,
    "image": "/images/vertical-stripped-shirt.png",
    "category": "Shirts",
    "description": "Vertical Striped Shirt \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": true
  },
  {
    "legacyId": 52,
    "name": "Courage Graphic T-shirt",
    "price": 145,
    "oldPrice": null,
    "discount": null,
    "rating": 4.0,
    "image": "/images/courage-graphic-t-shirt.png",
    "category": "T-shirts",
    "description": "Courage Graphic T-shirt \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": true
  },
  {
    "legacyId": 53,
    "name": "Loose Fit Bermuda Shorts",
    "price": 80,
    "oldPrice": null,
    "discount": null,
    "rating": 3.0,
    "image": "/images/loose-fit-bermuda-shorts.png",
    "category": "Shorts",
    "description": "Loose Fit Bermuda Shorts \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": false
  },
  {
    "legacyId": 54,
    "name": "Faded Skinny Jeans",
    "price": 210,
    "oldPrice": null,
    "discount": null,
    "rating": 4.5,
    "image": "/images/faded-skinny-jeans.png",
    "category": "Jeans",
    "description": "Faded Skinny Jeans \u2014 Shop.Co collection.",
    "sizes": [
      "Small",
      "Medium",
      "Large",
      "X-Large"
    ],
    "colors": [
      "Olive",
      "Teal",
      "Navy"
    ],
    "stock": 50,
    "isFeatured": true
  }
];
(async () => {
  try {
    await connectDB();
    
    // 1. Seed Products
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} Shop.Co products from your frontend JSON.`);

    // 2. Seed Admin User
    const adminEmail = "admin@shopco.com";
    await User.deleteMany({ email: { $in: [adminEmail, "customer@shopco.com"] } });
    
    const adminUser = await User.create({
      name: "M AHSAN RAZA",
      email: adminEmail,
      password: await bcrypt.hash("admin12345", 12),
      role: "admin",
      avatar: "/ahsan-raza.jpg",
    });
    console.log(`Admin account created: email="${adminEmail}", password="admin12345"`);

    // 3. Seed Demo Customer & Sample Order
    const customerUser = await User.create({
      name: "Ahmed Khan",
      email: "customer@shopco.com",
      password: await bcrypt.hash("customer12345", 12),
      role: "customer",
    });

    if (insertedProducts.length >= 2) {
      await Order.deleteMany({});
      const p1 = insertedProducts[0];
      const p2 = insertedProducts[1];
      const subtotal = p1.price + p2.price * 2;
      const discountAmount = Math.round(subtotal * 0.2);
      const deliveryFee = 15;
      const total = subtotal - discountAmount + deliveryFee;

      await Order.create({
        user: customerUser._id,
        items: [
          {
            product: p1._id,
            legacyId: p1.legacyId,
            name: p1.name,
            image: p1.image,
            price: p1.price,
            quantity: 1,
            size: "Large",
            color: "Navy",
          },
          {
            product: p2._id,
            legacyId: p2.legacyId,
            name: p2.name,
            image: p2.image,
            price: p2.price,
            quantity: 2,
            size: "Medium",
            color: "Olive",
          },
        ],
        shippingAddress: {
          fullName: "Ahmed Khan",
          phone: "+92 300 1234567",
          address: "House 12, Street 4, F-8/2",
          city: "Islamabad",
          postalCode: "44000",
          country: "Pakistan",
        },
        subtotal,
        discountAmount,
        deliveryFee,
        total,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        status: "processing",
      });
      console.log("Sample order created for Ahmed Khan.");
    }

    console.log("Database seeded successfully!");
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
