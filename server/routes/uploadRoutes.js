const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getChunksDir } = require('../config/paths');
const uploadController = require('../controllers/uploadController');

// 配置 multer 存储分片
const chunkStorage = multer.diskStorage({
  destination(req, file, cb) {
    const chunkDir = path.join(getChunksDir(), req.body.fileHash);
    fs.mkdirSync(chunkDir, { recursive: true });
    cb(null, chunkDir);
  },
  filename(req, file, cb) {
    cb(null, req.body.chunkIndex);
  }
});

const upload = multer({
  storage: chunkStorage,
  limits: { fileSize: 6 * 1024 * 1024 } // 6MB（5MB分片 + 开销）
});

// 检查文件 / 获取已上传分片
router.post('/check', uploadController.check);

// 上传单个分片
router.post('/chunk', upload.single('chunk'), uploadController.uploadChunk);

// 合并所有分片
router.post('/merge', uploadController.merge);

// 获取已上传文件列表
router.get('/files', uploadController.listFiles);

// 下载文件
router.get('/download/:storedName', uploadController.download);

// 删除文件
router.delete('/files/:storedName', uploadController.deleteFile);

module.exports = router;
