const EmployeeModel = require('../models/employeeModel');

const employeeController = {
  // 获取员工列表（支持分页、筛选）
  getAll(req, res) {
    try {
      const { page, pageSize, keyword, department, status, hireDateStart, hireDateEnd } = req.query;
      const result = EmployeeModel.findAll({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        keyword,
        department,
        status,
        hireDateStart,
        hireDateEnd
      });
      res.json({ code: 200, data: result, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  // 获取单个员工详情
  getById(req, res) {
    try {
      const employee = EmployeeModel.findById(parseInt(req.params.id));
      if (!employee) {
        return res.status(404).json({ code: 404, message: '员工不存在' });
      }
      res.json({ code: 200, data: employee, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  // 创建员工（工号自动生成）
  create(req, res) {
    try {
      const employee = EmployeeModel.create(req.body);
      res.status(201).json({ code: 201, data: employee, message: '创建成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '创建失败', error: err.message });
    }
  },

  // 更新员工信息（工号不可修改）
  update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = EmployeeModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '员工不存在' });
      }

      const employee = EmployeeModel.update(id, req.body);
      res.json({ code: 200, data: employee, message: '更新成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '更新失败', error: err.message });
    }
  },

  // 删除员工（软删除）
  delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = EmployeeModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '员工不存在' });
      }

      EmployeeModel.softDelete(id);
      res.json({ code: 200, message: '删除成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '删除失败', error: err.message });
    }
  },

  // 批量删除（软删除）
  batchDelete(req, res) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ code: 400, message: '请提供要删除的员工ID数组' });
      }

      const result = EmployeeModel.batchSoftDelete(ids);
      res.json({ code: 200, data: { deleted: result.changes }, message: `成功删除 ${result.changes} 条记录` });
    } catch (err) {
      res.status(500).json({ code: 500, message: '批量删除失败', error: err.message });
    }
  },

  // 批量导入员工
  bulkImport(req, res) {
    try {
      const { employees } = req.body;

      if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ code: 400, message: '请提供员工数据数组' });
      }

      const results = EmployeeModel.bulkCreate(employees);
      res.json({
        code: 200,
        data: results,
        message: `导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: '导入失败', error: err.message });
    }
  },

  // CSV文件导入
  csvImport(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 400, message: '请上传CSV文件' });
      }

      const csvParser = require('csv-parser');
      const fs = require('fs');
      const employees = [];

      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
          employees.push({
            name: row['姓名'] || row['name'] || '',
            department: row['部门'] || row['department'] || '',
            position: row['职位'] || row['position'] || '',
            phone: row['手机号'] || row['phone'] || '',
            email: row['邮箱'] || row['email'] || '',
            hireDate: row['入职日期'] || row['hireDate'] || '',
            status: row['状态'] || row['status'] || '在职',
            gender: row['性别'] || row['gender'] || null,
            birthday: row['生日'] || row['birthday'] || null,
            address: row['地址'] || row['address'] || null,
            remark: row['备注'] || row['remark'] || null
          });
        })
        .on('end', () => {
          const results = EmployeeModel.bulkCreate(employees);
          fs.unlinkSync(req.file.path);
          res.json({
            code: 200,
            data: results,
            message: `CSV导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`
          });
        })
        .on('error', (err) => {
          res.status(500).json({ code: 500, message: 'CSV解析失败', error: err.message });
        });
    } catch (err) {
      res.status(500).json({ code: 500, message: '导入失败', error: err.message });
    }
  },

  // 导出员工数据（CSV格式）
  export(req, res) {
    try {
      const { keyword, department, status, hireDateStart, hireDateEnd } = req.query;
      const employees = EmployeeModel.findAllForExport({ keyword, department, status, hireDateStart, hireDateEnd });

      // 生成CSV
      const headers = ['工号', '姓名', '部门', '职位', '手机号', '邮箱', '入职日期', '状态', '性别', '生日', '地址', '备注'];
      const fields = ['employeeId', 'name', 'department', 'position', 'phone', 'email', 'hireDate', 'status', 'gender', 'birthday', 'address', 'remark'];

      let csv = '\uFEFF' + headers.join(',') + '\n'; // BOM for Excel UTF-8
      for (const emp of employees) {
        const row = fields.map(f => {
          const val = emp[f] || '';
          // 包含逗号或引号的字段用引号包裹
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csv += row.join(',') + '\n';
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=employees_${Date.now()}.csv`);
      res.send(csv);
    } catch (err) {
      res.status(500).json({ code: 500, message: '导出失败', error: err.message });
    }
  },

  // 获取统计数据
  getStats(req, res) {
    try {
      const stats = EmployeeModel.getStats();
      res.json({ code: 200, data: stats, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  // 办理离职
  resign(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = EmployeeModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '员工不存在' });
      }
      if (existing.status === '离职') {
        return res.status(400).json({ code: 400, message: '该员工已离职' });
      }

      const { resignDate, resignReason } = req.body;
      const employee = EmployeeModel.resign(id, { resignDate, resignReason });
      res.json({ code: 200, data: employee, message: '离职办理成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '离职办理失败', error: err.message });
    }
  },

  // 获取离职员工列表
  getResigned(req, res) {
    try {
      const { page, pageSize, keyword, department, resignDateStart, resignDateEnd } = req.query;
      const result = EmployeeModel.findResigned({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        keyword,
        department,
        resignDateStart,
        resignDateEnd
      });
      res.json({ code: 200, data: result, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  }
};

module.exports = employeeController;
