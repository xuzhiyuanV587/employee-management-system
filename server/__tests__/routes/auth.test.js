const request = require('supertest');
const { db } = require('../../config/database');

let app;

beforeAll(() => {
  app = require('../../app.js');
});

beforeEach(() => {
  db.prepare("DELETE FROM users WHERE username != 'superadmin'").run();
});

describe('POST /api/auth/register', () => {
  test('应成功注册新用户', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'regtest', password: 'password123', displayName: '注册测试' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('regtest');
  });

  test('重复用户名应返回 400', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupuser', password: 'password123', displayName: '重复' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupuser', password: 'password123', displayName: '重复' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('正确凭证应登录成功', async () => {
    // 先注册
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'loginuser', password: 'password123', displayName: '登录用户' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('错误密码应返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  test('记住我应正常工作', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'superadmin', remember: true });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});

describe('GET /api/auth/me', () => {
  test('携带 Token 应返回用户信息', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'superadmin' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('superadmin');
  });

  test('无 Token 应返回 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('User Management API (admin)', () => {
  let adminToken;

  beforeEach(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'superadmin' });
    adminToken = loginRes.body.data.token;
  });

  test('GET /users 应返回用户列表', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /users 应创建新用户', async () => {
    const res = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'newbyadmin', password: 'password123', displayName: '管理员创建' });

    expect(res.status).toBe(201);
    expect(res.body.data.username).toBe('newbyadmin');
  });

  test('DELETE /users/:id 应删除非 superadmin 用户', async () => {
    // 创建用户
    const createRes = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'todelete', password: 'password123', displayName: '待删除' });

    const userId = createRes.body.data.id;
    const res = await request(app)
      .delete(`/api/auth/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test('PUT /users/:id/status 应更新用户状态', async () => {
    const createRes = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'toggleuser', password: 'password123', displayName: '状态切换' });

    const userId = createRes.body.data.id;
    const res = await request(app)
      .put(`/api/auth/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'disabled' });

    expect(res.status).toBe(200);
  });

  test('PUT /users/:id/reset-password 应重置密码', async () => {
    const createRes = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'resetpwduser', password: 'password123', displayName: '重置密码' });

    const userId = createRes.body.data.id;
    const res = await request(app)
      .put(`/api/auth/users/${userId}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'newpassword123' });

    expect(res.status).toBe(200);
  });

  test('PUT /users/:id/reset-password 密码过短应返回 400', async () => {
    const createRes = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'resetpwduser2', password: 'password123', displayName: '重置密码2' });

    const userId = createRes.body.data.id;
    const res = await request(app)
      .put(`/api/auth/users/${userId}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: '123' });

    expect(res.status).toBe(400);
  });

  test('DELETE /users/:id 删除 superadmin 应被拒绝', async () => {
    const superadminUser = db.prepare("SELECT id FROM users WHERE username = 'superadmin'").get();
    const res = await request(app)
      .delete(`/api/auth/users/${superadminUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

describe('非管理员访问管理接口', () => {
  let normalToken;

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'normaluser', password: 'password123', displayName: '普通用户' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'normaluser', password: 'password123' });
    normalToken = loginRes.body.data.token;
  });

  test('GET /users 非管理员应返回 403', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });

  test('POST /users 非管理员应返回 403', async () => {
    const res = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${normalToken}`)
      .send({ username: 'another', password: 'password123', displayName: '另一个' });

    expect(res.status).toBe(403);
  });

  test('DELETE /users/:id 非管理员应返回 403', async () => {
    const res = await request(app)
      .delete('/api/auth/users/1')
      .set('Authorization', `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });
});
