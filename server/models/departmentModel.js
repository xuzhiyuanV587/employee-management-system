const { db } = require('../config/database');

const DepartmentModel = {
  // 获取所有部门
  findAll() {
    return db.prepare(`
      SELECT d.*,
        (SELECT COUNT(*) FROM employees e WHERE e.department = d.name AND e.deleted_at IS NULL) as employee_count
      FROM departments d
      ORDER BY d.name
    `).all();
  },

  // 根据ID查询部门
  findById(id) {
    return db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
  },

  // 根据名称查询部门
  findByName(name) {
    return db.prepare('SELECT * FROM departments WHERE name = ?').get(name);
  },

  // 创建部门
  create({ name, description }) {
    const stmt = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description || null);
    return this.findById(result.lastInsertRowid);
  },

  // 更新部门
  update(id, { name, description }) {
    const stmt = db.prepare(`
      UPDATE departments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, description || null, id);
    return this.findById(id);
  },

  // 删除部门
  delete(id) {
    return db.prepare('DELETE FROM departments WHERE id = ?').run(id);
  }
};

module.exports = DepartmentModel;
