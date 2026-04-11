const request = require('supertest');
const { db } = require('../../config/database');

let app;
let adminToken;

beforeAll(async () => {
  app = require('../../app.js');

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'superadmin' });
  adminToken = loginRes.body.data.token;
});

describe('GET /api/employees/resigned', () => {
  test('应返回离职员工列表', async () => {
    const res = await request(app)
      .get('/api/employees/resigned')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('应支持分页查询', async () => {
    const res = await request(app)
      .get('/api/employees/resigned?page=1&pageSize=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.pageSize).toBe(5);
    expect(Array.isArray(res.body.data.list)).toBe(true);
  });
});

describe('POST /api/employees/resign/:id', () => {
  test('应办理员工离职', async () => {
    // 先创建一个在职员工
    const employees = db.prepare(
      "SELECT id FROM employees WHERE status = '在职' AND deleted_at IS NULL LIMIT 1"
    ).get();

    if (employees) {
      const res = await request(app)
        .post(`/api/employees/resign/${employees.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ resignDate: '2026-04-08', resignReason: '测试离职' });

      expect(res.status).toBe(200);
    }
  });

  test('不存在的员工应返回 404', async () => {
    const res = await request(app)
      .post('/api/employees/resign/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resignDate: '2026-04-08', resignReason: '测试' });

    expect(res.status).toBe(404);
  });

  test('重复离职应返回 400', async () => {
    // 创建新员工用于测试
    const createRes = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '重复离职测试',
        department: '技术部',
        position: '工程师',
        phone: '13800000001',
        email: 'resign-dup@test.com',
        hireDate: '2024-01-01'
      });

    const employeeId = createRes.body.data.id;

    // 第一次离职
    await request(app)
      .post(`/api/employees/resign/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resignDate: '2026-04-08', resignReason: '第一次离职' });

    // 第二次离职应返回 400
    const res = await request(app)
      .post(`/api/employees/resign/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resignDate: '2026-04-08', resignReason: '重复离职' });

    expect(res.status).toBe(400);
  });
});
