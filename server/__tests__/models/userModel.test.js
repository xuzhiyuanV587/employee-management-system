const userModel = require('../../models/userModel');
const { db } = require('../../config/database');

describe('userModel', () => {
  beforeEach(() => {
    // 清理测试数据，保留 superadmin
    db.prepare("DELETE FROM users WHERE username != 'superadmin'").run();
  });

  describe('createUser & getUserByUsername', () => {
    test('应成功创建用户并可通过用户名查询', () => {
      const user = userModel.createUser({
        username: 'testuser',
        password: 'password123',
        displayName: '测试用户'
      });

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.displayName).toBe('测试用户');
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');

      const found = userModel.getUserByUsername('testuser');
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
    });

    test('密码应该被加密存储', () => {
      userModel.createUser({
        username: 'passtest',
        password: 'mypassword',
        displayName: '密码测试'
      });

      const user = userModel.getUserByUsername('passtest');
      expect(user.password).not.toBe('mypassword');
      expect(user.password.length).toBeGreaterThan(20);
    });
  });

  describe('getAllUsers', () => {
    test('应返回所有用户', () => {
      userModel.createUser({ username: 'user1', password: 'pass123', displayName: '用户1' });
      userModel.createUser({ username: 'user2', password: 'pass123', displayName: '用户2' });

      const users = userModel.getAllUsers();
      expect(users.length).toBeGreaterThanOrEqual(2); // at least the 2 created
    });
  });

  describe('deleteUser', () => {
    test('应成功删除用户', () => {
      const user = userModel.createUser({
        username: 'todelete',
        password: 'pass123',
        displayName: '待删除'
      });

      userModel.deleteUser(user.id);
      const found = userModel.getUserByUsername('todelete');
      expect(found).toBeUndefined();
    });
  });

  describe('updatePassword', () => {
    test('应成功更新密码', () => {
      const user = userModel.createUser({
        username: 'pwdtest',
        password: 'oldpass',
        displayName: '密码测试'
      });

      userModel.updatePassword(user.id, 'newpass123');
      // 验证用户仍然存在
      const found = userModel.getUserByUsername('pwdtest');
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
    });
  });

  describe('updateStatus', () => {
    test('应成功更新用户状态', () => {
      const user = userModel.createUser({
        username: 'statustest',
        password: 'pass123',
        displayName: '状态测试'
      });

      userModel.updateStatus(user.id, 'disabled');
      const updated = userModel.getUserById(user.id);
      expect(updated.status).toBe('disabled');
    });
  });

  describe('usernameExists', () => {
    test('已存在的用户名返回 true', () => {
      userModel.createUser({ username: 'exists', password: 'pass123', displayName: '存在' });
      expect(userModel.usernameExists('exists')).toBe(true);
    });

    test('不存在的用户名返回 false', () => {
      expect(userModel.usernameExists('nonexistent')).toBe(false);
    });
  });
});
