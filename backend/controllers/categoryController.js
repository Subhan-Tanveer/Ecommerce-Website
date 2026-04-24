import categoryModel from '../models/categoryModel.js'
import { v2 as cloudinary } from 'cloudinary'

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({})
    res.json({ success: true, categories })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Add a top-level category
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    const exists = await categoryModel.findOne({ name })
    if (exists) return res.json({ success: false, message: 'Category already exists' })

    let imageUrl = ''
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'trendify/categories', quality: 'auto', fetch_format: 'auto', transformation: [{ width: 800, crop: 'limit' }] },
          (error, result) => {
            if (error) reject(error)
            else resolve(result.secure_url)
          }
        ).end(req.file.buffer)
      })
    }

    await categoryModel.create({ name, description: description || '', image: imageUrl, subCategories: [] })
    res.json({ success: true, message: 'Category added' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Update a top-level category
const updateCategory = async (req, res) => {
  try {
    const { categoryId, name, description } = req.body
    const updateData = { name, description }
    if (req.file) {
      const url = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'trendify/categories', quality: 'auto', fetch_format: 'auto', transformation: [{ width: 800, crop: 'limit' }] },
          (error, result) => {
            if (error) reject(error)
            else resolve(result.secure_url)
          }
        ).end(req.file.buffer)
      })
      updateData.image = url
    }
    await categoryModel.findByIdAndUpdate(categoryId, updateData)
    res.json({ success: true, message: 'Category updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete a top-level category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body
    await categoryModel.findByIdAndDelete(categoryId)
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Add a subCategory under a category
const addSubCategory = async (req, res) => {
  try {
    const { categoryId, name } = req.body
    const category = await categoryModel.findById(categoryId)
    if (!category) return res.json({ success: false, message: 'Category not found' })
    const exists = category.subCategories.find(s => s.name === name)
    if (exists) return res.json({ success: false, message: 'Sub category already exists' })
    category.subCategories.push({ name, subSubCategories: [] })
    await category.save()
    res.json({ success: true, message: 'Sub category added' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete a subCategory
const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.body
    await categoryModel.findByIdAndUpdate(categoryId, {
      $pull: { subCategories: { _id: subCategoryId } }
    })
    res.json({ success: true, message: 'Sub category deleted' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Add a subSubCategory under a subCategory
const addSubSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId, name } = req.body
    const category = await categoryModel.findById(categoryId)
    if (!category) return res.json({ success: false, message: 'Category not found' })
    const subCat = category.subCategories.id(subCategoryId)
    if (!subCat) return res.json({ success: false, message: 'Sub category not found' })
    if (subCat.subSubCategories.includes(name))
      return res.json({ success: false, message: 'Sub sub category already exists' })
    subCat.subSubCategories.push(name)
    await category.save()
    res.json({ success: true, message: 'Sub sub category added' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete a subSubCategory
const deleteSubSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId, name } = req.body
    const category = await categoryModel.findById(categoryId)
    const subCat = category.subCategories.id(subCategoryId)
    subCat.subSubCategories = subCat.subSubCategories.filter(s => s !== name)
    await category.save()
    res.json({ success: true, message: 'Sub sub category deleted' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export { getCategories, addCategory, updateCategory, deleteCategory, addSubCategory, deleteSubCategory, addSubSubCategory, deleteSubSubCategory }
