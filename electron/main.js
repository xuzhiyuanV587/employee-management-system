const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let server;

const userDataPath = app.getPath('userData');
const isDev = !app.isPackaged;

// 设置环境变量
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'electron-app-secret-key';

// 打包后 server 整体放在 Resources/server 中
// node_modules 被重命名为 deps 以绕过 electron-builder 的过滤
const serverDir = isDev
  ? path.join(__dirname, '..', 'server')
  : path.join(process.resourcesPath, 'server');

if (!isDev) {
  const depsDir = path.join(serverDir, 'deps');
  process.env.NODE_PATH = depsDir;
  require('module').Module._initPaths();
}

app.whenReady().then(() => {
  // macOS 设置 Dock 图标
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, 'icons', 'icon.png'));
  }

  const { createApp } = require(path.join(serverDir, 'app'));

  const staticDir = isDev
    ? path.join(__dirname, '..', 'frontend', 'dist')
    : path.join(process.resourcesPath, 'frontend-dist');

  const expressApp = createApp({
    dataDir: userDataPath,
    staticDir
  });

  // 动态端口启动
  server = expressApp.listen(0, () => {
    const port = server.address().port;
    console.log(`Express 服务已启动: http://localhost:${port}`);

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      title: '员工管理系统',
      icon: path.join(__dirname, 'icons', 'icon.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    mainWindow.loadURL(`http://localhost:${port}`);

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null && server) {
    const port = server.address().port;
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      title: '员工管理系统',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    mainWindow.loadURL(`http://localhost:${port}`);
  }
});
