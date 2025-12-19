const Admin = require('../models/Admin');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username, isActive: true });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const { accessToken, refreshToken } = generateTokens({
      id: admin._id,
      username: admin.username,
      role: admin.role
    });

    admin.addRefreshToken(refreshToken);
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        refreshToken,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.refreshTokens.some(rt => rt.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: admin._id,
      username: admin.username,
      role: admin.role
    });

    admin.removeRefreshToken(refreshToken);
    admin.addRefreshToken(newRefreshToken);
    await admin.save();

    res.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (refreshToken && admin) {
      admin.removeRefreshToken(refreshToken);
      await admin.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const verify = async (req, res) => {
  res.json({
    success: true,
    data: {
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        role: req.admin.role
      }
    }
  });
};

module.exports = {
  login,
  refreshToken,
  logout,
  verify
};