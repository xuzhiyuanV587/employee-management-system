const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// DB_PATH 相对于 server/ 目录解析
const configuredPath = process.env.DB_PATH || './data/employee.db';
const dbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(__dirname, '..', configuredPath);
const db = new Database(dbPath);

// 启用 WAL 模式以提高并发性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  // 部门表
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 员工表 - 与PRD字段定义对齐
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      hireDate DATE NOT NULL,
      status TEXT DEFAULT '在职' CHECK(status IN ('在职', '离职', '试用期')),
      gender TEXT CHECK(gender IN ('男', '女')),
      birthday DATE,
      address TEXT,
      remark TEXT,
      deleted_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入默认部门数据（与PRD一致）
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get();
  if (deptCount.count === 0) {
    const insertDept = db.prepare('INSERT OR IGNORE INTO departments (name, description) VALUES (?, ?)');
    const defaultDepts = [
      ['技术部', '负责产品研发和技术支持'],
      ['产品部', '负责产品规划和设计'],
      ['市场部', '负责市场推广和品牌运营'],
      ['财务部', '负责财务管理和核算'],
      ['人事部', '负责人力资源管理'],
      ['运营部', '负责日常运营管理']
    ];
    const insertMany = db.transaction((depts) => {
      for (const [name, desc] of depts) {
        insertDept.run(name, desc);
      }
    });
    insertMany(defaultDepts);
  }

  // 迁移：添加离职相关字段
  const columns = db.prepare("PRAGMA table_info(employees)").all().map(c => c.name);
  if (!columns.includes('resignDate')) {
    db.exec("ALTER TABLE employees ADD COLUMN resignDate DATE");
  }
  if (!columns.includes('resignReason')) {
    db.exec("ALTER TABLE employees ADD COLUMN resignReason TEXT");
  }

  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      displayName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 初始化超级管理员
  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'superadmin'").get();
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('superadmin', 10);
    db.prepare("INSERT INTO users (username, password, displayName, role) VALUES (?, ?, ?, ?)").run(
      'superadmin', hash, '超级管理员', 'admin'
    );
  }

  console.log('数据库初始化完成');
}

module.exports = { db, initDatabase };
