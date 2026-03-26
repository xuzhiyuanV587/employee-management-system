const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'employee-mgmt-secret-key-2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或登录已过期' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限，仅管理员可操作' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, JWT_SECRET };
