const path = require('path');
const fs = require('fs');

// 默认数据根目录 = server/ 目录（standalone 模式）
let dataDir = path.resolve(__dirname, '..');

function configure(options) {
  if (options.dataDir) {
    dataDir = options.dataDir;
  }
  // 确保所有必需目录存在
  const dirs = [getDataDir(), getChunksDir(), getFilesDir(), getTempDir()];
  dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
}

function getDataDir() {
  return path.join(dataDir, 'data');
}

function getDbPath() {
  const configured = process.env.DB_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(dataDir, configured);
  }
  return path.join(dataDir, 'data', 'employee.db');
}

function getUploadsDir() {
  return path.join(dataDir, 'uploads');
}

function getChunksDir() {
  return path.join(dataDir, 'uploads', 'chunks');
}

function getFilesDir() {
  return path.join(dataDir, 'uploads', 'files');
}

function getTempDir() {
  return path.join(dataDir, 'uploads', 'temp');
}

module.exports = {
  configure,
  getDataDir,
  getDbPath,
  getUploadsDir,
  getChunksDir,
  getFilesDir,
  getTempDir
};
