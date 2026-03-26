/**
 * 演示数据导入脚本
 * 用法: node scripts/seed-demo-data.js
 *
 * 导入10条覆盖各部门、各状态的演示员工数据，
 * 方便快速启动系统后看到完整的数据效果。
 */

require('dotenv').config();
const { db, initDatabase } = require('../config/database');
const EmployeeModel = require('../models/employeeModel');

// 10条演示员工数据
const demoEmployees = [
  {
    name: '张三',
    department: '技术部',
    position: '前端工程师',
    phone: '13800138001',
    email: 'zhangsan@company.com',
    hireDate: '2024-01-15',
    status: '在职',
    gender: '男',
    birthday: '1995-06-20',
    address: '北京市海淀区中关村大街1号',
    remark: '团队核心成员，负责前端架构设计'
  },
  {
    name: '李四',
    department: '产品部',
    position: '产品经理',
    phone: '13800138002',
    email: 'lisi@company.com',
    hireDate: '2023-06-01',
    status: '在职',
    gender: '女',
    birthday: '1992-03-15',
    address: '上海市浦东新区张江高科技园区',
    remark: '负责员工管理系统产品规划'
  },
  {
    name: '王五',
    department: '市场部',
    position: '市场专员',
    phone: '13800138003',
    email: 'wangwu@company.com',
    hireDate: '2024-03-20',
    status: '试用期',
    gender: '男',
    birthday: '1998-11-08',
    address: '广州市天河区珠江新城',
    remark: '新入职，试用期3个月'
  },
  {
    name: '赵六',
    department: '财务部',
    position: '财务主管',
    phone: '13800138004',
    email: 'zhaoliu@company.com',
    hireDate: '2022-09-10',
    status: '在职',
    gender: '女',
    birthday: '1988-07-22',
    address: '深圳市南山区科技园',
    remark: '10年财务经验，管理3人团队'
  },
  {
    name: '孙七',
    department: '人事部',
    position: 'HR专员',
    phone: '13800138005',
    email: 'sunqi@company.com',
    hireDate: '2023-11-05',
    status: '在职',
    gender: '女',
    birthday: '1996-01-30',
    address: '杭州市西湖区文三路',
    remark: '负责招聘和员工关系'
  },
  {
    name: '周八',
    department: '技术部',
    position: '后端工程师',
    phone: '13800138006',
    email: 'zhouba@company.com',
    hireDate: '2024-02-28',
    status: '在职',
    gender: '男',
    birthday: '1993-09-12',
    address: '成都市高新区天府软件园',
    remark: '精通 Node.js 和数据库设计'
  },
  {
    name: '吴九',
    department: '运营部',
    position: '运营经理',
    phone: '13800138007',
    email: 'wujiu@company.com',
    hireDate: '2021-07-15',
    status: '在职',
    gender: '男',
    birthday: '1990-04-05',
    address: '武汉市洪山区光谷广场',
    remark: '5年运营经验，带领运营团队'
  },
  {
    name: '郑十',
    department: '技术部',
    position: '测试工程师',
    phone: '13800138008',
    email: 'zhengshi@company.com',
    hireDate: '2024-05-10',
    status: '试用期',
    gender: '女',
    birthday: '1997-12-25',
    address: '南京市鼓楼区新街口',
    remark: '自动化测试方向'
  },
  {
    name: '陈明',
    department: '产品部',
    position: 'UI设计师',
    phone: '13800138009',
    email: 'chenming@company.com',
    hireDate: '2023-01-20',
    status: '离职',
    gender: '男',
    birthday: '1994-08-18',
    address: '重庆市渝北区互联网产业园',
    remark: '2025年2月离职，已完成交接'
  },
  {
    name: '林芳',
    department: '市场部',
    position: '品牌经理',
    phone: '13800138010',
    email: 'linfang@company.com',
    hireDate: '2022-12-01',
    status: '在职',
    gender: '女',
    birthday: '1991-05-14',
    address: '厦门市思明区软件园二期',
    remark: '负责公司品牌建设和推广策略'
  }
];

function seed() {
  // 确保数据库已初始化
  initDatabase();

  // 检查是否已有数据
  const existing = db.prepare('SELECT COUNT(*) as count FROM employees WHERE deleted_at IS NULL').get();
  if (existing.count > 0) {
    console.log(`数据库中已有 ${existing.count} 条员工记录。`);
    console.log('如需重新导入，请先删除数据库: rm -f data/employee.db');
    process.exit(0);
  }

  // 批量导入
  const results = EmployeeModel.bulkCreate(demoEmployees);

  console.log('========================================');
  console.log('  演示数据导入完成！');
  console.log('========================================');
  console.log(`  成功: ${results.success} 条`);
  console.log(`  失败: ${results.failed} 条`);

  if (results.errors.length > 0) {
    console.log('\n  失败详情:');
    results.errors.forEach(e => {
      console.log(`    第${e.row}行: ${e.message}`);
    });
  }

  // 显示数据概览
  const stats = EmployeeModel.getStats();
  console.log('\n  数据概览:');
  console.log(`    总员工数: ${stats.total}`);
  console.log('    按部门:');
  stats.byDepartment.forEach(d => console.log(`      ${d.department}: ${d.count}人`));
  console.log('    按状态:');
  stats.byStatus.forEach(s => console.log(`      ${s.status}: ${s.count}人`));
  console.log('========================================');
}

seed();
