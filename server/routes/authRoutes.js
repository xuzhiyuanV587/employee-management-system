const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authMiddleware, adminOnly, JWT_SECRET } = require('../middleware/auth');

// 登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '请输入用户名和密码' });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      code: 200,
      data: {
        token,
        user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role }
      },
      message: '登录成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '登录失败', error: err.message });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, username, displayName, role, status, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }
  res.json({ code: 200, data: user, message: '查询成功' });
});

// === 账号管理（仅管理员） ===

// 获取账号列表
router.get('/users', authMiddleware, adminOnly, (req, res) => {
  try {
    const users = db.prepare("SELECT id, username, displayName, role, status, created_at, updated_at FROM users ORDER BY created_at DESC").all();
    res.json({ code: 200, data: users, message: '查询成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '查询失败', error: err.message });
  }
});

// 创建子账号
router.post('/users', authMiddleware, adminOnly, (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    if (!username || !password || !displayName) {
      return res.status(400).json({ code: 400, message: '用户名、密码和显示名称不能为空' });
    }
    if (username.length < 3) {
      return res.status(400).json({ code: 400, message: '用户名至少3个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码至少6个字符' });
    }

    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (username, password, displayName, role) VALUES (?, ?, ?, 'user')").run(username, hash, displayName);
    const user = db.prepare("SELECT id, username, displayName, role, status, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);

    res.status(201).json({ code: 201, data: user, message: '账号创建成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建失败', error: err.message });
  }
});

// 删除账号
router.delete('/users/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '账号不存在' });
    }
    if (user.username === 'superadmin') {
      return res.status(400).json({ code: 400, message: '不能删除超级管理员账号' });
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除失败', error: err.message });
  }
});

// 重置密码
router.put('/users/:id/reset-password', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码至少6个字符' });
    }

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '账号不存在' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(hash, id);
    res.json({ code: 200, message: '密码重置成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '重置失败', error: err.message });
  }
});

// 启用/禁用账号
router.put('/users/:id/status', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ code: 400, message: '状态值无效' });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '账号不存在' });
    }
    if (user.username === 'superadmin') {
      return res.status(400).json({ code: 400, message: '不能禁用超级管理员账号' });
    }

    db.prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
    res.json({ code: 200, message: status === 'active' ? '已启用' : '已禁用' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '操作失败', error: err.message });
  }
});

module.exports = router;
