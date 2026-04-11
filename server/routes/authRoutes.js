const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const authController = require('../controllers/authController');

// 公开路由
router.post('/login', authController.login);
router.post('/register', authController.register);

// 需要认证的路由
router.get('/me', authMiddleware, authController.getMe);

// 管理员路由
router.get('/users', authMiddleware, adminOnly, authController.getUsers);
router.post('/users', authMiddleware, adminOnly, authController.createUser);
router.delete('/users/:id', authMiddleware, adminOnly, authController.deleteUser);
router.put('/users/:id/reset-password', authMiddleware, adminOnly, authController.resetPassword);
router.put('/users/:id/status', authMiddleware, adminOnly, authController.toggleStatus);

module.exports = router;
