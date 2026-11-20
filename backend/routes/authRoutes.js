const express = require('express');
const { z } = require('zod');
const { login, logout } = require('../controllers/authController');
const requireAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const loginSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict();

router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', requireAdmin, asyncHandler(logout));

module.exports = router;
