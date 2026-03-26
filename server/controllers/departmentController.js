const DepartmentModel = require('../models/departmentModel');

const departmentController = {
  // 获取所有部门
  getAll(req, res) {
    try {
      const departments = DepartmentModel.findAll();
      res.json({ code: 200, data: departments, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  // 获取单个部门
  getById(req, res) {
    try {
      const department = DepartmentModel.findById(parseInt(req.params.id));
      if (!department) {
        return res.status(404).json({ code: 404, message: '部门不存在' });
      }
      res.json({ code: 200, data: department, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  // 创建部门
  create(req, res) {
    try {
      const { name } = req.body;
      const existing = DepartmentModel.findByName(name);
      if (existing) {
        return res.status(400).json({ code: 400, message: `部门 "${name}" 已存在` });
      }

      const department = DepartmentModel.create(req.body);
      res.status(201).json({ code: 201, data: department, message: '创建成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '创建失败', error: err.message });
    }
  },

  // 更新部门
  update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = DepartmentModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '部门不存在' });
      }

      const department = DepartmentModel.update(id, req.body);
      res.json({ code: 200, data: department, message: '更新成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '更新失败', error: err.message });
    }
  },

  // 删除部门
  delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = DepartmentModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '部门不存在' });
      }

      DepartmentModel.delete(id);
      res.json({ code: 200, message: '删除成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '删除失败', error: err.message });
    }
  }
};

module.exports = departmentController;
