const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let server;

const userDataPath = app.getPath('userData');

// 设置环境变量
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'electron-app-secret-key';

app.whenReady().then(() => {
  const { createApp } = require('../server/app');

  const isDev = !app.isPackaged;
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
