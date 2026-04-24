import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";

// INFO: Function to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// INFO: Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      const token = createToken(user._id);
      res.status(200).json({ success: true, token, name: user.name, role: user.role, package: user.package, permissions: user.permissions || null });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // INFO: Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // INFO: Validating email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // INFO: Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // INFO: Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // INFO: Save user to database
    const user = await newUser.save();

    // INFO: Create token
    const token = createToken(user._id);

    // INFO: Return success response
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Seed admin user if not exists
const seedAdmin = async () => {
  try {
    const existing = await userModel.findOne({ email: 'admin@tech.com' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await userModel.create({ name: 'Admin', email: 'admin@tech.com', password: hashedPassword, role: 'admin', package: 'none' });
      console.log('Admin user created: admin@tech.com / admin123');
    } else if (existing.role !== 'admin') {
      await userModel.findByIdAndUpdate(existing._id, { role: 'admin' });
    }
  } catch (error) {
    console.log('Admin seed error:', error.message);
  }
};

// INFO: Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, '-password').sort({ _id: -1 })
    res.json({ success: true, users })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// INFO: Update user role and package (admin only)
const updateUserAccess = async (req, res) => {
  try {
    const { userId, role, package: pkg } = req.body
    await userModel.findByIdAndUpdate(userId, { role, package: pkg })
    res.json({ success: true, message: 'User access updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// INFO: Get current logged-in user info (role + package)
const getMe = async (req, res) => {
  try {
    const decoded = (await import('jsonwebtoken')).default.verify(req.headers.token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.id, '-password')
    if (!user) return res.json({ success: false, message: 'User not found' })
    res.json({ success: true, role: user.role, package: user.package, name: user.name })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// INFO: Route for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.status(200).json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Update custom permissions for a vendor
const updateUserPermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body
    await userModel.findByIdAndUpdate(userId, { permissions })
    res.json({ success: true, message: 'Permissions updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export { loginUser, registerUser, loginAdmin, seedAdmin, getAllUsers, updateUserAccess, getMe, updateUserPermissions };
