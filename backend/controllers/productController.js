import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// INFO: Route for adding a product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      subSubCategory,
      sizes,
      bestSeller,
      quantity,
      isActive,
    } = req.body;

    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];
    const image5 = req.files?.image5 && req.files.image5[0];
    const image6 = req.files?.image6 && req.files.image6[0];

    const productImages = [image1, image2, image3, image4, image5, image6].filter(
      (image) => image !== undefined
    );

    if (productImages.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one product image' })
    }

    let imageUrls = await Promise.all(
      productImages.map((image) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'trendify/products', quality: 'auto', fetch_format: 'auto', transformation: [{ width: 1200, crop: 'limit' }] },
            (error, result) => {
              if (error) reject(error)
              else resolve(result.secure_url)
            }
          ).end(image.buffer)
        })
      })
    );

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      subSubCategory: subSubCategory || '',
      sizes: JSON.parse(sizes),
      bestSeller: bestSeller === 'true' ? true : false,
      quantity: Number(quantity) || 0,
      isActive: isActive === 'false' ? false : true,
      image: imageUrls,
      vendorId: req.user?._id?.toString() || null,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Product added" });
  } catch (error) {
    console.log("Error while adding product: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for fetching all products
const listProducts = async (req, res) => {
  try {
    const { vendorFilter } = req.query
    const user = req.user // set by adminAuth if token provided

    let query = {}

    if (user && user.role === 'vendor') {
      // Vendor sees only their own products
      query.vendorId = user._id.toString()
    } else if (vendorFilter && vendorFilter !== 'all') {
      // Admin filtering by specific vendor
      query.vendorId = vendorFilter
    }

    const products = await productModel.find(query)
    res.status(200).json({ success: true, products })
  } catch (error) {
    console.log("Error while fetching all products: ", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// INFO: Route for removing a product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.status(200).json({ success: true, message: "Product removed" });
  } catch (error) {
    console.log("Error while removing product: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for fetching a single product
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log("Error while fetching single product: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for updating a product
const updateProduct = async (req, res) => {
  try {
    const { productId, name, description, price, category, subCategory, subSubCategory, sizes, bestSeller, quantity } = req.body
    await productModel.findByIdAndUpdate(productId, {
      name, description, price: Number(price),
      category, subCategory, subSubCategory,
      sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
      bestSeller: bestSeller === 'true' || bestSeller === true,
      quantity: Number(quantity)
    })
    res.json({ success: true, message: 'Product updated' })
  } catch (error) {
    console.log('Error while updating product: ', error)
    res.json({ success: false, message: error.message })
  }
}

// INFO: Route for toggling product active status
const toggleProduct = async (req, res) => {
  try {
    const { productId } = req.body
    const product = await productModel.findById(productId)
    await productModel.findByIdAndUpdate(productId, { isActive: !product.isActive })
    res.json({ success: true, message: `Product ${!product.isActive ? 'enabled' : 'disabled'}` })
  } catch (error) {
    console.log('Error while toggling product: ', error)
    res.json({ success: false, message: error.message })
  }
}

export { addProduct, listProducts, removeProduct, getSingleProduct, updateProduct, toggleProduct };
