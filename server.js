const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const multer = require('multer');

const path = require('path');
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static('public')); // serve static files from /public folder

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/smartlife', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
  });
  
  const Category = mongoose.model('Category', CategorySchema);
  
// Product Schema
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    mainImageUrl: String,
    images: [String], // array of additional images
    buyLink: String,
    seeMoreLink: String,
    specialCategory: { type: String, default: 'none' } // <-- added

  });

  

const Product = mongoose.model('Product', ProductSchema);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // save inside uploads folder
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  // Multer Upload Instance
  const upload = multer({ storage: storage });
  
  // Make 'uploads' folder public
  app.use('/uploads', express.static('uploads'));



// API Routes
app.post('/products', upload.fields([{ name: 'mainImage' }, { name: 'galleryImages' }]), async (req, res) => {
    try {
      const { name, price, category, description, buyLink, seeMoreLink, specialCategory } = req.body;
  
      const mainImageUrl = req.files['mainImage'][0].path;
      const images = req.files['galleryImages'] ? req.files['galleryImages'].map(file => file.path) : [];
  
      const newProduct = new Product({
        name,
        price,
        category,
        description,
        mainImageUrl,
        images,
        buyLink,
        seeMoreLink,
        specialCategory   // 🛑 Save specialCategory
      });
  
      await newProduct.save();
      res.status(201).json(newProduct);
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  
  

app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

// Add new category
app.post('/categories', async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        await newCategory.save();
        res.status(201).send(newCategory);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
// Get ONE product by ID
app.get('/products/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send('Product not found');
      res.send(product);
  } catch (error) {
      res.status(500).send('Server error');
  }
});


app.put('/products/:id', upload.fields([{ name: 'mainImage' }, { name: 'galleryImages' }]), async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            specialCategory: req.body.specialCategory
        };

        if (req.files['mainImage']) {
            updates.mainImageUrl = req.files['mainImage'][0].path;
        }

        if (req.files['galleryImages']) {
            updates.images = req.files['galleryImages'].map(file => file.path);
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedProduct) return res.status(404).send('Product not found');
        res.send(updatedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Delete ONE product by ID
app.delete('/products/:id', async (req, res) => {
  try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) return res.status(404).send('Product not found');
      res.send('Product deleted');
  } catch (error) {
      res.status(500).send('Server error');
  }
});

// Get all categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.send(categories);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
// Update ONE category by ID
app.put('/categories/:id', async (req, res) => {
  try {
      const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id,
          { name: req.body.name },
          { new: true }
      );
      if (!updatedCategory) return res.status(404).send('Category not found');
      res.send(updatedCategory);
  } catch (error) {
      res.status(500).send('Server error');
  }
});
// Delete ONE category by ID
app.delete('/categories/:id', async (req, res) => {
  try {
      const deletedCategory = await Category.findByIdAndDelete(req.params.id);
      if (!deletedCategory) return res.status(404).send('Category not found');
      res.send('Category deleted');
  } catch (error) {
      res.status(500).send('Server error');
  }
});


// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
