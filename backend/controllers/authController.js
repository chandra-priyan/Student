const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function login(req, res) {
  const admin = await Admin.findOne({ email: req.body.email }).select('+passwordHash');
  const passwordMatches = admin
    ? await bcrypt.compare(req.body.password, admin.passwordHash)
    : false;

  if (!admin || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { role: admin.role },
    process.env.JWT_SECRET,
    { subject: admin.id, expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return res.json({
    token,
    admin: { id: admin.id, email: admin.email, role: admin.role },
  });
}

function logout(req, res) {
  return res.json({ message: 'Signed out. Please discard the access token.' });
}

module.exports = { login, logout };
