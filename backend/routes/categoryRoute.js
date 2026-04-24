import express from 'express'
import {
  getCategories, addCategory, updateCategory, deleteCategory,
  addSubCategory, deleteSubCategory,
  addSubSubCategory, deleteSubSubCategory
} from '../controllers/categoryController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const categoryRouter = express.Router()

categoryRouter.get('/list', getCategories)
categoryRouter.post('/add', adminAuth, upload.single('image'), addCategory)
categoryRouter.post('/update', adminAuth, upload.single('image'), updateCategory)
categoryRouter.post('/delete', adminAuth, deleteCategory)
categoryRouter.post('/sub/add', adminAuth, addSubCategory)
categoryRouter.post('/sub/delete', adminAuth, deleteSubCategory)
categoryRouter.post('/subsub/add', adminAuth, addSubSubCategory)
categoryRouter.post('/subsub/delete', adminAuth, deleteSubSubCategory)

export default categoryRouter
