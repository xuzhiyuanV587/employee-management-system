const { body, param, query } = require('express-validator');

// 有效部门列表（与PRD一致）
const VALID_DEPARTMENTS = ['技术部', '产品部', '市场部', '财务部', '人事部', '运营部'];
const VALID_STATUSES = ['在职', '离职', '试用期'];

// 员工数据验证规则
const employeeValidation = {
  create: [
    body('name').notEmpty().withMessage('姓名不能为空').trim(),
    body('department').notEmpty().withMessage('部门不能为空').isIn(VALID_DEPARTMENTS).withMessage('部门值无效'),
    body('position').notEmpty().withMessage('职位不能为空').trim(),
    body('phone').notEmpty().withMessage('手机号不能为空').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式无效（需为11位手机号）'),
    body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式无效').trim(),
    body('hireDate').notEmpty().withMessage('入职日期不能为空').isDate().withMessage('入职日期格式无效'),
    body('status').optional({ values: 'falsy' }).isIn(VALID_STATUSES).withMessage('状态值无效'),
    body('gender').optional({ values: 'falsy' }).isIn(['男', '女']).withMessage('性别值无效'),
    body('birthday').optional({ values: 'falsy' }).isDate().withMessage('生日格式无效'),
    body('address').optional({ values: 'falsy' }).trim(),
    body('remark').optional({ values: 'falsy' }).trim()
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('员工ID无效'),
    body('name').optional({ values: 'falsy' }).notEmpty().withMessage('姓名不能为空').trim(),
    body('department').optional({ values: 'falsy' }).isIn(VALID_DEPARTMENTS).withMessage('部门值无效'),
    body('position').optional({ values: 'falsy' }).notEmpty().withMessage('职位不能为空').trim(),
    body('phone').optional({ values: 'falsy' }).matches(/^1[3-9]\d{9}$/).withMessage('手机号格式无效（需为11位手机号）'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('邮箱格式无效').trim(),
    body('hireDate').optional({ values: 'falsy' }).isDate().withMessage('入职日期格式无效'),
    body('status').optional({ values: 'falsy' }).isIn(VALID_STATUSES).withMessage('状态值无效'),
    body('gender').optional({ values: 'falsy' }).isIn(['男', '女']).withMessage('性别值无效'),
    body('birthday').optional({ values: 'falsy' }).isDate().withMessage('生日格式无效'),
    body('address').optional({ values: 'falsy' }).trim(),
    body('remark').optional({ values: 'falsy' }).trim()
  ],

  query: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
    query('status').optional({ values: 'falsy' }).isIn(VALID_STATUSES).withMessage('状态值无效'),
    query('department').optional({ values: 'falsy' }).isIn(VALID_DEPARTMENTS).withMessage('部门值无效'),
    query('hireDateStart').optional({ values: 'falsy' }).isDate().withMessage('开始日期格式无效'),
    query('hireDateEnd').optional({ values: 'falsy' }).isDate().withMessage('结束日期格式无效')
  ]
};

// 部门数据验证规则
const departmentValidation = {
  create: [
    body('name').notEmpty().withMessage('部门名称不能为空').trim(),
    body('description').optional().trim()
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('部门ID无效'),
    body('name').notEmpty().withMessage('部门名称不能为空').trim(),
    body('description').optional().trim()
  ]
};

module.exports = { employeeValidation, departmentValidation };
