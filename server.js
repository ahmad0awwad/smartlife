// === SmartLife Admin Server (Full) ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '/')));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

mongoose.connect('mongodb://localhost:27017/smartlife', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});
const Category = mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    mainImageUrl: String,
    images: [String],
    buyLink: String,
    seeMoreLink: String,
    specialCategory: { type: String, default: 'none' }
});
const Product = mongoose.model('Product', ProductSchema);

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  password: String,
  area: String,
  street: String,
  block: String,
  houseNumber: String
});
const User = mongoose.model('User', UserSchema);
const OrderSchema = new mongoose.Schema({
  userPhone: String,
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId, // still keep reference
      name: String, // 🆕 product name at the time of order
      price: Number, // 🆕 optional but helpful
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  source: { type: String, default: 'direct' },
  medium: { type: String },
  campaign: { type: String },
  firstSource: { type: String },
  firstUtmMedium: { type: String },
  firstUtmCampaign: { type: String }
});

const Order = mongoose.model('Order', OrderSchema);

const AnalyticsSchema = new mongoose.Schema({
  event: String,
  createdAt: { type: Date, default: Date.now }
});
const Analytics = mongoose.model('Analytics', AnalyticsSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// === User Auth ===
app.post('/signup', async (req, res) => {
    const existingUser = await User.findOne({ phone: req.body.phone });
    if (existingUser) return res.status(400).json({ message: 'Phone already exists!' });

    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ phone: req.body.phone });
    if (!user || user.password !== req.body.password)
        return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json(user);
});

// === Products ===
app.post('/products', upload.fields([{ name: 'mainImage' }, { name: 'galleryImages' }]), async (req, res) => {
    const { name, price, category, description, buyLink, seeMoreLink, specialCategory } = req.body;
    const mainImageUrl = req.files['mainImage'][0].path;
    const images = req.files['galleryImages'] ? req.files['galleryImages'].map(f => f.path) : [];

    const product = new Product({ name, price, category, description, mainImageUrl, images, buyLink, seeMoreLink, specialCategory });
    await product.save();
    res.status(201).json(product);
});

app.get('/products', async (req, res) => res.send(await Product.find()));
app.get('/products/:id', async (req, res) => res.send(await Product.findById(req.params.id)));
app.put('/products/:id', upload.fields([{ name: 'mainImage' }, { name: 'galleryImages' }]), async (req, res) => {
    const updates = { ...req.body };
    if (req.files['mainImage']) updates.mainImageUrl = req.files['mainImage'][0].path;
    if (req.files['galleryImages']) updates.images = req.files['galleryImages'].map(f => f.path);
    res.send(await Product.findByIdAndUpdate(req.params.id, updates, { new: true }));
});
app.delete('/products/:id', async (req, res) => res.send(await Product.findByIdAndDelete(req.params.id)));

// === Categories ===
app.post('/categories', async (req, res) => res.status(201).send(await new Category(req.body).save()));
app.get('/categories', async (req, res) => res.send(await Category.find()));
app.put('/categories/:id', async (req, res) => res.send(await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })));
app.delete('/categories/:id', async (req, res) => res.send(await Category.findByIdAndDelete(req.params.id)));

// === Orders ===
// app.post('/orders', async (req, res) => {
//   try {
//     const { userPhone, products, totalAmount, source } = req.body;

//     // Enrich products with name and price
//     const enrichedProducts = await Promise.all(products.map(async p => {
//       const product = await Product.findById(p.productId);
//       if (!product) throw new Error(`Product not found: ${p.productId}`);
//       return {
//         productId: p.productId,
//         name: product.name,        // snapshot
//         price: product.price,      // optional but useful
//         quantity: p.quantity
//       };
//     }));

//     const newOrder = new Order({
//       userPhone,
//       products: enrichedProducts,
//       totalAmount,
//       source: source || 'direct'
//     });

//     await newOrder.save();
//     res.status(201).json(newOrder);

//   } catch (err) {
//     console.error('❌ Order creation failed:', err);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });
// app.post('/orders', async (req, res) => {
//   try {
//     const { userPhone, products, totalAmount, source } = req.body;

//     // Enrich products with name and price
//     const enrichedProducts = await Promise.all(products.map(async p => {
//       const product = await Product.findById(p.productId);
//       if (!product) throw new Error(`Product not found: ${p.productId}`);
//       return {
//         productId: p.productId,
//         name: product.name,        // snapshot
//         price: product.price,      // optional but useful
//         quantity: p.quantity
//       };
//     }));

//     // ✅ Log enriched data here
//     console.log('📦 Enriched products:', enrichedProducts);

//     const newOrder = new Order({
//       userPhone,
//       products: enrichedProducts,
//       totalAmount,
//       source: source || 'direct'
//     });

//     await newOrder.save();
//     res.status(201).json(newOrder);

//   } catch (err) {
//     console.error('❌ Order creation failed:', err);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });
app.post('/orders', async (req, res) => {
  try {
    const {
      userPhone,
      products,
      totalAmount,
      source,
      medium,
      campaign,
      firstSource,
      firstUtmMedium,
      firstUtmCampaign
    } = req.body;

    // Enrich products with name and price
    const enrichedProducts = await Promise.all(products.map(async p => {
      const product = await Product.findById(p.productId);
      if (!product) throw new Error(`Product not found: ${p.productId}`);
      return {
        productId: p.productId,
        name: product.name,
        price: product.price,
        quantity: p.quantity
      };
    }));

    console.log('📦 Enriched products:', enrichedProducts);

    const newOrder = new Order({
      userPhone,
      products: enrichedProducts,
      totalAmount,
      source: source || 'direct',
      medium,
      campaign,
      firstSource,
      firstUtmMedium,
      firstUtmCampaign
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (err) {
    console.error('❌ Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});



app.get('/orders/:userPhone', async (req, res) => res.json(await Order.find({ userPhone: req.params.userPhone })));
app.delete('/orders/:orderId', async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (order.status !== 'pending') return res.status(400).send('Cannot cancel processed order');
    await order.deleteOne();
    res.send('Order cancelled');
});

app.put('/orders/:orderId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).send('Order not found');
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error updating status');
  }
});


// app.get('/orders', async (req, res) => {
//   const { startDate, endDate, orderId } = req.query;
//   const query = {};
//   if (orderId) query._id = orderId;
//   if (startDate && endDate) {
//     query.createdAt = {
//       $gte: new Date(startDate),
//       $lte: new Date(endDate)
//     };
//   }
//   const orders = await Order.find(query);
//   const usersMap = {};
// const phones = [...new Set(orders.map(o => o.userPhone))];
// const users = await User.find({ phone: { $in: phones } });
// users.forEach(user => {
//   usersMap[user.phone] = user;
// });

// res.json(orders.map(order => ({
//   ...order.toObject(),
//   user: usersMap[order.userPhone] || null
// })));
// });
app.get('/orders', async (req, res) => {
  const { startDate, endDate, orderId } = req.query;
  const query = {};
  if (orderId) query._id = orderId;
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(query);
  const usersMap = {};
  const phones = [...new Set(orders.map(o => o.userPhone))];
  const users = await User.find({ phone: { $in: phones } });
  users.forEach(user => {
    usersMap[user.phone] = user;
  });

  res.json(orders.map(order => ({
    ...order.toObject(),
    user: usersMap[order.userPhone] || null
  })));
});

app.get('/admin/analytics/sources', async (req, res) => {
  const results = await Order.aggregate([
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  res.json(results);
});


// === User ===
app.get('/user/:phone', async (req, res) => res.json(await User.findOne({ phone: req.params.phone })));
app.put('/user/:phone', async (req, res) => res.json(await User.findOneAndUpdate({ phone: req.params.phone }, req.body, { new: true })));

// === Analytics Routes ===
app.post('/track-visit', async (req, res) => {
  await new Analytics({ event: 'visit' }).save();
  res.status(201).json({ message: 'Visit tracked' });
});

app.get('/admin/analytics/visits', async (req, res) => {
  const visits = await Analytics.countDocuments({ event: 'visit' });
  res.json({ visits });
});

app.get('/admin/analytics/sales', async (req, res) => {
  try {
    const orders = await Order.find();

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const productSales = {};
    const productNames = {};

    orders.forEach(order => {
      order.products.forEach(p => {
        const key = p.productId.toString();
        productSales[key] = (productSales[key] || 0) + p.quantity;

        // 🧠 Store snapshot name from the order
        if (!productNames[key]) {
          productNames[key] = p.name || 'Unknown';
        }
      });
    });

    const topProductId = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a])[0];

    res.json({
      totalSales,
      topProduct: {
        name: productNames[topProductId] || 'Unknown',
        totalSold: productSales[topProductId] || 0
      }
    });
  } catch (err) {
    console.error('🔥 Error in /admin/analytics/sales:', err);
    res.status(500).json({ error: 'Failed to compute sales analytics.' });
  }
});



app.get('/admin/analytics/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    const usersMap = {};
    const phones = [...new Set(orders.map(o => o.userPhone))];
    const users = await User.find({ phone: { $in: phones } });
    users.forEach(u => { usersMap[u.phone] = u; });

    const data = orders.map(o => ({
      _id: o._id,
      user: usersMap[o.userPhone] || null,
      userPhone: o.userPhone,
      status: o.status || 'pending',
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod || 'N/A',
      source: o.source || 'direct', 
      products: o.products || []
    }));

    res.json(data);
  } catch (err) {
    console.error('🔥 Error in /admin/analytics/orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/admin/analytics/chart-data', async (req, res) => {
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const data = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const visits = await Analytics.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } });
    const orders = await Order.find({ createdAt: { $gte: dayStart, $lte: dayEnd } });
    const sales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    data.push({ date: dayStart.toISOString().split('T')[0], visits, sales });
  }
  res.json(data);
});

app.get('/admin/analytics/report/pdf', async (req, res) => {
  const visits = await Analytics.countDocuments();
  const orders = await Order.find();
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const html = `<h1>SmartLife Weekly Report</h1><p>Total Visits: ${visits}</p><p>Total Sales: $${totalSales}</p>`;
  pdf.create(html).toBuffer((err, buffer) => {
    if (err) return res.status(500).send('PDF error');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(buffer);
  });
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


cron.schedule('0 8 * * 1', async () => {
  const visits = await Analytics.countDocuments();
  const orders = await Order.find();
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const content = `<h3>SmartLife Weekly Report</h3><p><strong>Total Sales:</strong> $${totalSales}</p><p><strong>Total Visits:</strong> ${visits}</p>`;
  await transporter.sendMail({
    to: process.env.EMAIL_RECEIVER,
    subject: '📈 Weekly Report - SmartLife Shop',
    html: content
  });
  
});

// === Start Server ===
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
