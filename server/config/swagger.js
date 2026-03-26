const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '员工管理系统 API',
      version: '1.0.0',
      description: '员工管理系统后端 API 文档',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: '开发环境'
      }
    ],
    components: {
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '员工ID'
            },
            employeeId: {
              type: 'string',
              description: '工号'
            },
            name: {
              type: 'string',
              description: '员工姓名'
            },
            email: {
              type: 'string',
              description: '邮箱'
            },
            phone: {
              type: 'string',
              description: '电话'
            },
            department: {
              type: 'string',
              description: '部门'
            },
            position: {
              type: 'string',
              description: '职位'
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: '入职日期'
            },
            salary: {
              type: 'number',
              description: '薪资'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'on_leave'],
              description: '状态'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '部门ID'
            },
            name: {
              type: 'string',
              description: '部门名称'
            },
            description: {
              type: 'string',
              description: '部门描述'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '响应码'
            },
            data: {
              type: 'object',
              properties: {
                list: {
                  type: 'array',
                  description: '数据列表'
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            },
            message: {
              type: 'string',
              description: '响应消息'
            }
          }
        }
      }
    }
  },
  apis: [
    require('path').join(__dirname, '../routes/employeeRoutes.js'),
    require('path').join(__dirname, '../routes/departmentRoutes.js')
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
