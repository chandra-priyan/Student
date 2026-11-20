const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const authorization = req.get('authorization');
  const token = authorization && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Administrator authentication is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin' || typeof payload.sub !== 'string') {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }

    req.admin = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'The session is invalid or has expired.' });
  }
}

module.exports = requireAdmin;
