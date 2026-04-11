/**
 * electron-builder 配置
 * 构建命令: pnpm run electron:build
 */
module.exports = {
  appId: 'com.example.employee-management',
  productName: '员工管理系统',
  directories: {
    output: 'release'
  },

  // 打包到 asar 中的文件
  files: [
    'electron/**/*',
    'server/**/*',
    '!server/data/**',
    '!server/uploads/**',
    '!server/.env',
    '!server/__tests__/**',
    '!server/jest.config.js',
    '!server/node_modules/.cache/**'
  ],

  // 额外资源（asar 外部，可被 Express.static 读取）
  extraResources: [
    {
      from: 'frontend/dist',
      to: 'frontend-dist',
      filter: ['**/*']
    }
  ],

  // macOS 配置
  mac: {
    category: 'public.app-category.business',
    target: [
      {
        target: 'dir',
        arch: ['arm64']
      }
    ]
  },

  asar: true,
  npmRebuild: true
};
