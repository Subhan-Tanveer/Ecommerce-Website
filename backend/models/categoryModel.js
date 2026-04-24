import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '', trim: true },
  image: { type: String, default: '' },
  subCategories: [
    {
      name: { type: String, required: true, trim: true },
      subSubCategories: [{ type: String, trim: true }]
    }
  ]
}, { timestamps: true })

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema)
export default categoryModel
