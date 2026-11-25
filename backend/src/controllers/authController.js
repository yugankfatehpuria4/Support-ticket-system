const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only allow admin role if explicitly seeded / existing admin creates — public register is always user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' && process.env.ALLOW_ADMIN_REGISTER === 'true' ? 'admin' : 'user',
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
};

module.exports = { register, login, getMe };
