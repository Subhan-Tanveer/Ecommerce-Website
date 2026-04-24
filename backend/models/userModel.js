import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    package: { type: String, enum: ['none', 'starter', 'booster', 'premium'], default: 'none' },
    permissions: {
      type: Object,
      default: null, // null = use package defaults, object = custom overrides
    },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
