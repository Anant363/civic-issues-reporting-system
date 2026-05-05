import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes — require valid JWT
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. No token provided.');
  }

  const decoded = verifyToken(token);
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    res.status(401);
    throw new Error('User belonging to this token no longer exists.');
  }

  next();
});
