import Product from '../models/Product.js';

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, image, usageInstructions, expectedResults, recommendedDurationDays } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({ success: false, message: 'Name, description, and image are required' });
    }

    const product = await Product.create({
      name,
      description,
      category: category || 'Wellness',
      image,
      usageInstructions,
      expectedResults,
      recommendedDurationDays: recommendedDurationDays || 90,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update product
// @route   PATCH /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
