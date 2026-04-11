const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

const authController = {
  login(req, res) {
    try {
      const { username, password, remember } = req.body;
      if (!username || !password) {
        return res.status(400).json({ code: 400, message: '请输入用户名和密码' });
      }

      const user = userModel.getUserByUsername(username);
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

      const expiresIn = remember ? '7d' : '24h';
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
        JWT_SECRET,
        { expiresIn }
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
  },

  register(req, res) {
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

      if (userModel.usernameExists(username)) {
        return res.status(400).json({ code: 400, message: '用户名已存在' });
      }

      const user = userModel.createUser({ username, password, displayName });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        code: 201,
        data: {
          token,
          user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role }
        },
        message: '注册成功'
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: '注册失败', error: err.message });
    }
  },

  getMe(req, res) {
    const user = userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 200, data: user, message: '查询成功' });
  },

  getUsers(req, res) {
    try {
      const users = userModel.getAllUsers();
      res.json({ code: 200, data: users, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  createUser(req, res) {
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

      if (userModel.usernameExists(username)) {
        return res.status(400).json({ code: 400, message: '用户名已存在' });
      }

      const user = userModel.createUser({ username, password, displayName });
      res.status(201).json({ code: 201, data: user, message: '账号创建成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '创建失败', error: err.message });
    }
  },

  deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const user = userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({ code: 404, message: '账号不存在' });
      }
      if (user.username === 'superadmin') {
        return res.status(400).json({ code: 400, message: '不能删除超级管理员账号' });
      }

      userModel.deleteUser(id);
      res.json({ code: 200, message: '删除成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '删除失败', error: err.message });
    }
  },

  resetPassword(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ code: 400, message: '密码至少6个字符' });
      }

      const user = userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({ code: 404, message: '账号不存在' });
      }

      userModel.updatePassword(id, password);
      res.json({ code: 200, message: '密码重置成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '重置失败', error: err.message });
    }
  },

  toggleStatus(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!['active', 'disabled'].includes(status)) {
        return res.status(400).json({ code: 400, message: '状态值无效' });
      }

      const user = userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({ code: 404, message: '账号不存在' });
      }
      if (user.username === 'superadmin') {
        return res.status(400).json({ code: 400, message: '不能禁用超级管理员账号' });
      }

      userModel.updateStatus(id, status);
      res.json({ code: 200, message: status === 'active' ? '已启用' : '已禁用' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '操作失败', error: err.message });
    }
  }
};

module.exports = authController;
