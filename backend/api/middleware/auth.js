// backend/api/middleware/auth.js

const authMiddleware = (req, res, next) => {
  // allow userId via header OR via query param
  const userId = req.header('x-user-id') || req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
  }
  // attach to req.user for downstream routes
  req.user = { id: userId };
  next();
};

module.exports = authMiddleware;
