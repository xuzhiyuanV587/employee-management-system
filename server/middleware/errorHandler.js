const { validationResult } = require('express-validator');

// 统一验证结果处理中间件
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

// 统一错误处理中间件
function errorHandler(err, req, res, next) {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = { handleValidation, errorHandler };
