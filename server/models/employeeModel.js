const { db } = require('../config/database');

const EmployeeModel = {
  // 生成工号: EMP-YYYYMMDD-XXX
  generateEmployeeId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const prefix = `EMP-${dateStr}-`;

    const last = db.prepare(
      "SELECT employeeId FROM employees WHERE employeeId LIKE ? ORDER BY employeeId DESC LIMIT 1"
    ).get(`${prefix}%`);

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(last.employeeId.split('-')[2]);
      seq = lastSeq + 1;
    }
    return `${prefix}${seq.toString().padStart(3, '0')}`;
  },

  // 创建员工
  create(data) {
    const employeeId = this.generateEmployeeId();
    const record = {
      employeeId,
      name: data.name,
      department: data.department,
      position: data.position,
      phone: data.phone,
      email: data.email,
      hireDate: data.hireDate,
      status: data.status || '在职',
      gender: data.gender || null,
      birthday: data.birthday || null,
      address: data.address || null,
      remark: data.remark || null
    };
    const stmt = db.prepare(`
      INSERT INTO employees (employeeId, name, department, position, phone, email,
        hireDate, status, gender, birthday, address, remark)
      VALUES (@employeeId, @name, @department, @position, @phone, @email,
        @hireDate, @status, @gender, @birthday, @address, @remark)
    `);
    const result = stmt.run(record);
    return this.findById(result.lastInsertRowid);
  },

  // 根据ID查询员工（排除软删除）
  findById(id) {
    return db.prepare(
      'SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL'
    ).get(id);
  },

  // 根据工号查询员工
  findByEmployeeId(employeeId) {
    return db.prepare(
      'SELECT * FROM employees WHERE employeeId = ? AND deleted_at IS NULL'
    ).get(employeeId);
  },

  // 查询员工列表（分页 + 筛选 + 排序）
  findAll({ page = 1, pageSize = 10, keyword, department, status, hireDateStart, hireDateEnd } = {}) {
    let whereClauses = ['e.deleted_at IS NULL'];
    let params = {};

    if (keyword) {
      whereClauses.push("(e.name LIKE @keyword OR e.employeeId LIKE @keyword OR e.phone LIKE @keyword)");
      params.keyword = `%${keyword}%`;
    }
    if (department) {
      whereClauses.push("e.department = @department");
      params.department = department;
    }
    if (status) {
      whereClauses.push("e.status = @status");
      params.status = status;
    }
    if (hireDateStart) {
      whereClauses.push("e.hireDate >= @hireDateStart");
      params.hireDateStart = hireDateStart;
    }
    if (hireDateEnd) {
      whereClauses.push("e.hireDate <= @hireDateEnd");
      params.hireDateEnd = hireDateEnd;
    }

    const whereSQL = 'WHERE ' + whereClauses.join(' AND ');
    const offset = (page - 1) * pageSize;

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM employees e ${whereSQL}`);
    const { total } = countStmt.get(params);

    const dataStmt = db.prepare(`
      SELECT * FROM employees e
      ${whereSQL}
      ORDER BY e.created_at DESC
      LIMIT @limit OFFSET @offset
    `);
    const list = dataStmt.all({ ...params, limit: pageSize, offset });

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  },

  // 获取所有员工（用于导出，支持筛选）
  findAllForExport({ keyword, department, status, hireDateStart, hireDateEnd } = {}) {
    let whereClauses = ['deleted_at IS NULL'];
    let params = {};

    if (keyword) {
      whereClauses.push("(name LIKE @keyword OR employeeId LIKE @keyword OR phone LIKE @keyword)");
      params.keyword = `%${keyword}%`;
    }
    if (department) {
      whereClauses.push("department = @department");
      params.department = department;
    }
    if (status) {
      whereClauses.push("status = @status");
      params.status = status;
    }
    if (hireDateStart) {
      whereClauses.push("hireDate >= @hireDateStart");
      params.hireDateStart = hireDateStart;
    }
    if (hireDateEnd) {
      whereClauses.push("hireDate <= @hireDateEnd");
      params.hireDateEnd = hireDateEnd;
    }

    const whereSQL = 'WHERE ' + whereClauses.join(' AND ');
    return db.prepare(`SELECT * FROM employees ${whereSQL} ORDER BY created_at DESC`).all(params);
  },

  // 更新员工
  update(id, data) {
    const fields = [];
    const params = { id };

    const allowedFields = ['name', 'department', 'position', 'phone', 'email',
      'hireDate', 'status', 'gender', 'birthday', 'address', 'remark'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = @${field}`);
        params[field] = data[field];
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = CURRENT_TIMESTAMP");

    const stmt = db.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = @id AND deleted_at IS NULL`);
    stmt.run(params);
    return this.findById(id);
  },

  // 软删除员工
  softDelete(id) {
    const stmt = db.prepare('UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL');
    return stmt.run(id);
  },

  // 批量软删除
  batchSoftDelete(ids) {
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) AND deleted_at IS NULL`);
    return stmt.run(...ids);
  },

  // 批量创建员工（事务）
  bulkCreate(employees) {
    const insertStmt = db.prepare(`
      INSERT INTO employees (employeeId, name, department, position, phone, email,
        hireDate, status, gender, birthday, address, remark)
      VALUES (@employeeId, @name, @department, @position, @phone, @email,
        @hireDate, @status, @gender, @birthday, @address, @remark)
    `);

    const results = { success: 0, failed: 0, errors: [] };

    const insertMany = db.transaction((rows) => {
      for (let i = 0; i < rows.length; i++) {
        try {
          const employeeId = this.generateEmployeeId();
          const row = {
            employeeId,
            name: rows[i].name,
            department: rows[i].department,
            position: rows[i].position,
            phone: rows[i].phone,
            email: rows[i].email,
            hireDate: rows[i].hireDate,
            status: rows[i].status || '在职',
            gender: rows[i].gender || null,
            birthday: rows[i].birthday || null,
            address: rows[i].address || null,
            remark: rows[i].remark || null
          };
          insertStmt.run(row);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row: i + 1, message: err.message, data: rows[i] });
        }
      }
    });

    insertMany(employees);
    return results;
  },

  // 获取统计数据
  getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM employees WHERE deleted_at IS NULL').get().count;
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM employees WHERE deleted_at IS NULL GROUP BY status').all();
    const byDepartment = db.prepare(
      'SELECT department, COUNT(*) as count FROM employees WHERE deleted_at IS NULL GROUP BY department'
    ).all();

    return { total, byStatus, byDepartment };
  },

  // 办理离职
  resign(id, { resignDate, resignReason }) {
    const stmt = db.prepare(`
      UPDATE employees SET status = '离职', resignDate = @resignDate, resignReason = @resignReason,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id AND deleted_at IS NULL
    `);
    stmt.run({ id, resignDate, resignReason: resignReason || null });
    return this.findById(id);
  },

  // 查询离职员工列表（分页 + 筛选）
  findResigned({ page = 1, pageSize = 10, keyword, department, resignDateStart, resignDateEnd } = {}) {
    let whereClauses = ["e.deleted_at IS NULL", "e.status = '离职'"];
    let params = {};

    if (keyword) {
      whereClauses.push("(e.name LIKE @keyword OR e.employeeId LIKE @keyword OR e.phone LIKE @keyword)");
      params.keyword = `%${keyword}%`;
    }
    if (department) {
      whereClauses.push("e.department = @department");
      params.department = department;
    }
    if (resignDateStart) {
      whereClauses.push("e.resignDate >= @resignDateStart");
      params.resignDateStart = resignDateStart;
    }
    if (resignDateEnd) {
      whereClauses.push("e.resignDate <= @resignDateEnd");
      params.resignDateEnd = resignDateEnd;
    }

    const whereSQL = 'WHERE ' + whereClauses.join(' AND ');
    const offset = (page - 1) * pageSize;

    const { total } = db.prepare(`SELECT COUNT(*) as total FROM employees e ${whereSQL}`).get(params);
    const list = db.prepare(`
      SELECT * FROM employees e ${whereSQL} ORDER BY e.resignDate DESC LIMIT @limit OFFSET @offset
    `).all({ ...params, limit: pageSize, offset });

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }
};

module.exports = EmployeeModel;
