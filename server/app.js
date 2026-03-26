require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { initDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 文档（Express 5 需要通过 Router 挂载）
const swaggerRouter = express.Router();
swaggerRouter.use(swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(swaggerSpecs));
app.use('/api-docs', swaggerRouter);

// Swagger JSON 端点
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/departments', authMiddleware, departmentRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务运行正常', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 初始化数据库并启动服务
initDatabase();

app.listen(PORT, () => {
  console.log(`员工管理系统后端服务已启动: http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api-docs`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;
