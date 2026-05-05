// Must be used AFTER protect middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied. Admins only.');
};

export default adminMiddleware;
