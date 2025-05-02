// backfill-orders.js
const mongoose = require('mongoose');

// Load the server to initialize DB connection and models
require('./server'); // assumes your models are declared in server.js

const Order = mongoose.model('Order');
const Product = mongoose.model('Product');

async function backfillProductNames() {
  try {
    const orders = await Order.find();

    for (const order of orders) {
      let updated = false;

      for (let i = 0; i < order.products.length; i++) {
        const p = order.products[i];

        if (p.name && p.price) continue; // skip already processed

        const product = await Product.findById(p.productId);
        if (product) {
          order.products[i].name = product.name;
          order.products[i].price = product.price;
          updated = true;
        } else {
          console.warn(`⚠️ Product not found for ID: ${p.productId}`);
        }
      }

      if (updated) {
        await order.save();
        console.log(`✅ Updated order ${order._id}`);
      }
    }

    console.log('🎉 Backfill complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

backfillProductNames();
