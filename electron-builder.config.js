/**
 * electron-builder 配置
 * 构建命令:
 *   pnpm run electron:build:intel  - Intel (x64) 打包
 *   pnpm run electron:build:m      - Apple Silicon (arm64) 打包
 */
const arch = process.env.BUILD_ARCH || 'x64';

module.exports = {
  appId: 'com.example.employee-management',
  productName: '员工管理系统',
  directories: {
    output: 'release'
  },

  // 打包到 asar 中的文件
  files: [
    'electron/**/*',
    '!electron/icons/*.bak'
  ],

  // 额外资源（asar 外部）
  // server 含原生模块(better-sqlite3)，必须放在 asar 外部
  extraResources: [
    {
      from: 'frontend/dist',
      to: 'frontend-dist',
      filter: ['**/*']
    },
    {
      from: '.electron-build/server',
      to: 'server',
      filter: ['**/*', '**/node_modules/**']
    }
  ],

  // macOS 配置
  mac: {
    icon: 'electron/icons/icon.icns',
    category: 'public.app-category.business',
    target: [
      {
        target: 'dir',
        arch: [arch]
      }
    ]
  },

  asar: true,
  npmRebuild: false
};
