const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { departmentValidation } = require('../middleware/validators');
const { handleValidation } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: 获取所有部门
 *     description: 获取所有部门列表
 *     tags:
 *       - 部门管理
 *     responses:
 *       200:
 *         description: 成功获取部门列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: 创建部门
 *     description: 创建新部门
 *     tags:
 *       - 部门管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 部门名称
 *               description:
 *                 type: string
 *                 description: 部门描述
 *     responses:
 *       201:
 *         description: 部门创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: 获取部门详情
 *     description: 获取单个部门的详细信息
 *     tags:
 *       - 部门管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 部门ID
 *     responses:
 *       200:
 *         description: 成功获取部门详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *                 message:
 *                   type: string
 *       404:
 *         description: 部门不存在
 */

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: 更新部门信息
 *     description: 更新部门信息
 *     tags:
 *       - 部门管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 部门ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
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
 *                   $ref: '#/components/schemas/Department'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: 删除部门
 *     description: 删除部门
 *     tags:
 *       - 部门管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 部门ID
 *     responses:
 *       200:
 *         description: 删除成功
 */

// 获取所有部门
router.get('/', departmentController.getAll);

// 创建部门
router.post('/', departmentValidation.create, handleValidation, departmentController.create);

// 获取单个部门
router.get('/:id', departmentController.getById);

// 更新部门
router.put('/:id', departmentValidation.update, handleValidation, departmentController.update);

// 删除部门
router.delete('/:id', departmentController.delete);

module.exports = router;
