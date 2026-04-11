const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const paths = require('./config/paths');

function createApp(options = {}) {
  // Electron 模式：先配置数据目录
  if (options.dataDir) {
    paths.configure({ dataDir: options.dataDir });
  }

  // 加载环境变量（standalone 模式）
  if (!options.dataDir) {
    require('dotenv').config();
  }

  const { initDatabase } = require('./config/database');
  const { errorHandler } = require('./middleware/errorHandler');
  const { authMiddleware } = require('./middleware/auth');
  const authRoutes = require('./routes/authRoutes');
  const employeeRoutes = require('./routes/employeeRoutes');
  const departmentRoutes = require('./routes/departmentRoutes');
  const uploadRoutes = require('./routes/uploadRoutes');

  const app = express();

  // 中间件
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger 文档（仅开发环境）
  if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpecs = require('./config/swagger');
    const swaggerRouter = express.Router();
    swaggerRouter.use(swaggerUi.serve);
    swaggerRouter.get('/', swaggerUi.setup(swaggerSpecs));
    app.use('/api-docs', swaggerRouter);
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpecs);
    });
  }

  // API 路由
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', authMiddleware, employeeRoutes);
  app.use('/api/departments', authMiddleware, departmentRoutes);
  app.use('/api/upload', authMiddleware, uploadRoutes);

  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({ code: 200, message: '服务运行正常', timestamp: new Date().toISOString() });
  });

  // 静态文件服务（Electron 模式）
  if (options.staticDir) {
    app.use(express.static(options.staticDir));
    // SPA fallback：非 /api 路由返回 index.html
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(options.staticDir, 'index.html'));
    });
  }

  // 错误处理
  app.use(errorHandler);

  // 初始化数据库
  initDatabase();

  return app;
}

// standalone 模式（直接 node app.js）
if (require.main === module) {
  require('dotenv').config();
  const app = createApp();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`员工管理系统后端服务已启动: http://localhost:${PORT}`);
    console.log(`API 文档: http://localhost:${PORT}/api-docs`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
  });
}

module.exports = { createApp };
