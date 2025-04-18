const authMiddleware = (req, res, next) => {
    // For illustration: use a header value to simulate authentication
    const userId = req.header('x-user-id');
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
    }
    
    // Attach user info to the request (in a real app, verify JWT or session)
    req.user = { id: userId };
    next();
  };
  
  module.exports = authMiddleware;
  