import jwt from 'jsonwebtoken';

// Generate a signed JWT for a user
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify a JWT and return the decoded payload
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
