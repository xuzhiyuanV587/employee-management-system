const { db } = require('../../config/database');
const bcrypt = require('bcryptjs');

// Mock req/res
function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; }
  };
  return res;
}

// 直接测试 authController 逻辑（不通过 HTTP）
const authController = require('../../controllers/authController');

describe('authController', () => {
  beforeEach(() => {
    db.prepare("DELETE FROM users WHERE username != 'superadmin'").run();
  });

  describe('register', () => {
    test('应成功注册新用户', () => {
      const req = {
        body: { username: 'newuser', password: 'password123', displayName: '新用户' }
      };
      const res = mockRes();

      authController.register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.code).toBe(201);
      expect(res.body.data.user.username).toBe('newuser');
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.token).toBeDefined();
    });

    test('用户名已存在时应返回 400', () => {
      const req = {
        body: { username: 'superadmin', password: 'password123', displayName: '重复' }
      };
      const res = mockRes();

      authController.register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('用户名已存在');
    });

    test('缺少必填字段时应返回 400', () => {
      const req = { body: { username: 'test' } };
      const res = mockRes();

      authController.register(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('密码太短时应返回 400', () => {
      const req = {
        body: { username: 'shortpw', password: '12', displayName: '短密码' }
      };
      const res = mockRes();

      authController.register(req, res);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('login', () => {
    test('缺少用户名或密码应返回 400', () => {
      const req = { body: { username: '', password: '' } };
      const res = mockRes();
      authController.login(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('正确凭证应登录成功', () => {
      // 先注册
      const regReq = {
        body: { username: 'loginuser', password: 'password123', displayName: '登录用户' }
      };
      const regRes = mockRes();
      authController.register(regReq, regRes);

      const req = {
        body: { username: 'loginuser', password: 'password123' }
      };
      const res = mockRes();

      authController.login(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('loginuser');
    });

    test('错误密码应返回 401', () => {
      const regReq = {
        body: { username: 'wrongpw', password: 'password123', displayName: '错误密码' }
      };
      const regRes = mockRes();
      authController.register(regReq, regRes);

      const req = {
        body: { username: 'wrongpw', password: 'wrongpassword' }
      };
      const res = mockRes();

      authController.login(req, res);
      expect(res.statusCode).toBe(401);
    });

    test('禁用账号应返回 403', () => {
      const regReq = {
        body: { username: 'disableduser', password: 'password123', displayName: '禁用用户' }
      };
      const regRes = mockRes();
      authController.register(regReq, regRes);
      const userId = regRes.body.data.user.id;

      // 禁用用户
      db.prepare("UPDATE users SET status = 'disabled' WHERE id = ?").run(userId);

      const req = {
        body: { username: 'disableduser', password: 'password123' }
      };
      const res = mockRes();

      authController.login(req, res);
      expect(res.statusCode).toBe(403);
    });

    test('remember=true 时 token 有效期延长', () => {
      const req = {
        body: { username: 'superadmin', password: 'superadmin', remember: true }
      };
      const res = mockRes();
      authController.login(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('getMe', () => {
    test('应返回当前用户信息', () => {
      const req = { user: { id: 1 } };
      const res = mockRes();

      authController.getMe(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('superadmin');
    });

    test('用户不存在应返回 404', () => {
      const req = { user: { id: 99999 } };
      const res = mockRes();

      authController.getMe(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('createUser', () => {
    test('应成功创建用户', () => {
      const req = {
        body: { username: 'adminuser', password: 'password123', displayName: '管理员创建' }
      };
      const res = mockRes();
      authController.createUser(req, res);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.username).toBe('adminuser');
    });

    test('缺少必填字段应返回 400', () => {
      const req = { body: { username: 'onlyuser' } };
      const res = mockRes();
      authController.createUser(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('用户名太短应返回 400', () => {
      const req = { body: { username: 'ab', password: 'password123', displayName: '短名' } };
      const res = mockRes();
      authController.createUser(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('密码太短应返回 400', () => {
      const req = { body: { username: 'validuser', password: '12', displayName: '短密码' } };
      const res = mockRes();
      authController.createUser(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('用户名已存在应返回 400', () => {
      const req = { body: { username: 'superadmin', password: 'password123', displayName: '重复' } };
      const res = mockRes();
      authController.createUser(req, res);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('deleteUser', () => {
    test('应成功删除用户', () => {
      const regReq = { body: { username: 'deltest', password: 'password123', displayName: '删除测试' } };
      const regRes = mockRes();
      authController.register(regReq, regRes);
      const userId = regRes.body.data.user.id;

      const req = { params: { id: String(userId) } };
      const res = mockRes();
      authController.deleteUser(req, res);
      expect(res.statusCode).toBe(200);
    });

    test('用户不存在应返回 404', () => {
      const req = { params: { id: '99999' } };
      const res = mockRes();
      authController.deleteUser(req, res);
      expect(res.statusCode).toBe(404);
    });

    test('不能删除 superadmin', () => {
      const req = { params: { id: '1' } };
      const res = mockRes();
      authController.deleteUser(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('超级管理员');
    });
  });

  describe('resetPassword', () => {
    test('应成功重置密码', () => {
      const regReq = { body: { username: 'resettest', password: 'oldpass123', displayName: '重置测试' } };
      const regRes = mockRes();
      authController.register(regReq, regRes);
      const userId = regRes.body.data.user.id;

      const req = { params: { id: String(userId) }, body: { password: 'newpass123' } };
      const res = mockRes();
      authController.resetPassword(req, res);
      expect(res.statusCode).toBe(200);
    });

    test('密码太短应返回 400', () => {
      const req = { params: { id: '1' }, body: { password: '12' } };
      const res = mockRes();
      authController.resetPassword(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('用户不存在应返回 404', () => {
      const req = { params: { id: '99999' }, body: { password: 'newpass123' } };
      const res = mockRes();
      authController.resetPassword(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('toggleStatus', () => {
    test('应成功切换状态', () => {
      const regReq = { body: { username: 'statustest', password: 'pass123456', displayName: '状态测试' } };
      const regRes = mockRes();
      authController.register(regReq, regRes);
      const userId = regRes.body.data.user.id;

      const req = { params: { id: String(userId) }, body: { status: 'disabled' } };
      const res = mockRes();
      authController.toggleStatus(req, res);
      expect(res.statusCode).toBe(200);
    });

    test('无效状态值应返回 400', () => {
      const req = { params: { id: '1' }, body: { status: 'invalid' } };
      const res = mockRes();
      authController.toggleStatus(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('用户不存在应返回 404', () => {
      const req = { params: { id: '99999' }, body: { status: 'disabled' } };
      const res = mockRes();
      authController.toggleStatus(req, res);
      expect(res.statusCode).toBe(404);
    });

    test('不能禁用 superadmin', () => {
      const req = { params: { id: '1' }, body: { status: 'disabled' } };
      const res = mockRes();
      authController.toggleStatus(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('超级管理员');
    });
  });

  describe('getUsers', () => {
    test('应返回用户列表', () => {
      const req = {};
      const res = mockRes();
      authController.getUsers(req, res);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
