const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getTempDir } = require('../config/paths');
const employeeController = require('../controllers/employeeController');
const { employeeValidation } = require('../middleware/validators');
const { handleValidation } = require('../middleware/errorHandler');

// 配置文件上传
const upload = multer({
  dest: getTempDir(),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('只支持CSV文件格式'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: 获取员工列表
 *     description: 获取员工列表，支持分页、筛选
 *     tags:
 *       - 员工管理
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词（名字、工号、邮箱）
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, on_leave]
 *         description: 状态筛选
 *     responses:
 *       200:
 *         description: 成功获取员工列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: 创建员工
 *     description: 创建新员工（工号自动生成）
 *     tags:
 *       - 员工管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - department
 *               - position
 *               - hireDate
 *               - salary
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *               hireDate:
 *                 type: string
 *                 format: date
 *               salary:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave]
 *                 default: active
 *     responses:
 *       201:
 *         description: 员工创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/employees/stats:
 *   get:
 *     summary: 获取员工统计数据
 *     description: 获取员工总数、各部门人数等统计信息
 *     tags:
 *       - 员工管理
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 */

/**
 * @swagger
 * /api/employees/export:
 *   get:
 *     summary: 导出员工数据
 *     description: 导出员工数据为CSV文件
 *     tags:
 *       - 员工管理
 *     responses:
 *       200:
 *         description: 成功导出数据
 */

/**
 * @swagger
 * /api/employees/batch-delete:
 *   post:
 *     summary: 批量删除员工
 *     description: 批量删除员工（软删除）
 *     tags:
 *       - 员工管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 批量删除成功
 */

/**
 * @swagger
 * /api/employees/import:
 *   post:
 *     summary: 批量导入员工
 *     description: 批量导入员工数据（JSON格式）
 *     tags:
 *       - 员工管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employees
 *             properties:
 *               employees:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 导入成功
 */

/**
 * @swagger
 * /api/employees/import/csv:
 *   post:
 *     summary: CSV文件导入员工
 *     description: 通过CSV文件导入员工数据
 *     tags:
 *       - 员工管理
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CSV导入成功
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: 获取员工详情
 *     description: 获取单个员工的详细信息
 *     tags:
 *       - 员工管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 员工ID
 *     responses:
 *       200:
 *         description: 成功获取员工详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *                 message:
 *                   type: string
 *       404:
 *         description: 员工不存在
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: 更新员工信息
 *     description: 更新员工信息（工号不可修改）
 *     tags:
 *       - 员工管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 员工ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *               salary:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: 删除员工
 *     description: 删除员工（软删除）
 *     tags:
 *       - 员工管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 员工ID
 *     responses:
 *       200:
 *         description: 删除成功
 */

// 获取统计数据
router.get('/stats', employeeController.getStats);

// 导出员工数据
router.get('/export', employeeController.export);

// 批量删除（软删除）- 必须在 /:id 之前
router.post('/batch-delete', employeeController.batchDelete);

// 批量导入（JSON）- 必须在 /:id 之前
router.post('/import', employeeController.bulkImport);

// CSV文件导入 - 必须在 /:id 之前
router.post('/import/csv', upload.single('file'), employeeController.csvImport);

// 离职员工列表 - 必须在 /:id 之前
router.get('/resigned', employeeController.getResigned);

// 办理离职 - 必须在 /:id 之前
router.post('/resign/:id', employeeController.resign);

// 获取员工列表（支持分页、筛选）
router.get('/', employeeValidation.query, handleValidation, employeeController.getAll);

// 创建员工
router.post('/', employeeValidation.create, handleValidation, employeeController.create);

// 获取单个员工详情
router.get('/:id', employeeController.getById);

// 更新员工信息
router.put('/:id', employeeValidation.update, handleValidation, employeeController.update);

// 删除员工（软删除）
router.delete('/:id', employeeController.delete);

module.exports = router;
