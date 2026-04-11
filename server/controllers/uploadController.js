const fs = require('fs');
const path = require('path');
const { getChunksDir, getFilesDir } = require('../config/paths');

const CHUNKS_DIR = getChunksDir();
const FILES_DIR = getFilesDir();

const uploadController = {
  // POST /api/upload/check — 检查文件是否存在（秒传）/ 获取已上传分片（断点续传）
  check(req, res) {
    const { fileHash, fileName } = req.body;
    if (!fileHash || !fileName) {
      return res.status(400).json({
        code: 400,
        message: '缺少 fileHash 或 fileName 参数'
      });
    }

    const ext = path.extname(fileName);
    const filePath = path.join(FILES_DIR, `${fileHash}${ext}`);

    // 检查合并后的文件是否已存在
    if (fs.existsSync(filePath)) {
      return res.json({
        code: 200,
        data: { exists: true, filePath: `files/${fileHash}${ext}` },
        message: '文件已存在，秒传成功'
      });
    }

    // 检查已上传的分片
    const chunkDir = path.join(CHUNKS_DIR, fileHash);
    let uploadedChunks = [];
    if (fs.existsSync(chunkDir)) {
      uploadedChunks = fs.readdirSync(chunkDir)
        .map(name => parseInt(name, 10))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
    }

    res.json({
      code: 200,
      data: { exists: false, uploadedChunks },
      message: '查询成功'
    });
  },

  // POST /api/upload/chunk — 上传单个分片
  uploadChunk(req, res) {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未接收到分片文件'
      });
    }
    const { chunkIndex } = req.body;
    res.json({
      code: 200,
      data: { chunkIndex: parseInt(chunkIndex, 10) },
      message: '分片上传成功'
    });
  },

  // POST /api/upload/merge — 合并所有分片
  async merge(req, res) {
    const { fileHash, fileName, totalChunks } = req.body;
    if (!fileHash || !fileName || !totalChunks) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    const ext = path.extname(fileName);
    const chunkDir = path.join(CHUNKS_DIR, fileHash);
    const targetPath = path.join(FILES_DIR, `${fileHash}${ext}`);
    const total = parseInt(totalChunks, 10);

    // 检查所有分片是否存在
    for (let i = 0; i < total; i++) {
      if (!fs.existsSync(path.join(chunkDir, String(i)))) {
        return res.status(400).json({
          code: 400,
          message: `分片 ${i} 缺失，无法合并`
        });
      }
    }

    try {
      // 流式合并：逐个 pipe 分片到写入流，避免内存溢出
      const writeStream = fs.createWriteStream(targetPath);

      for (let i = 0; i < total; i++) {
        const chunkPath = path.join(chunkDir, String(i));
        await new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(chunkPath);
          readStream.on('error', reject);
          readStream.on('end', resolve);
          readStream.pipe(writeStream, { end: false });
        });
      }

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        writeStream.end();
      });

      // 清理分片目录
      fs.rmSync(chunkDir, { recursive: true, force: true });
      const stat = fs.statSync(targetPath);

      // 保存元数据
      const metaPath = targetPath + '.meta.json';
      fs.writeFileSync(metaPath, JSON.stringify({
        originalName: fileName,
        fileHash,
        fileSize: stat.size,
        uploadedAt: new Date().toISOString()
      }));

      res.json({
        code: 200,
        data: { filePath: `files/${fileHash}${ext}`, fileSize: stat.size },
        message: '文件合并成功'
      });
    } catch (err) {
      // 合并失败时清理不完整的目标文件
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      res.status(500).json({
        code: 500,
        message: '文件合并失败',
        error: err.message
      });
    }
  },

  // GET /api/upload/files — 获取已上传文件列表
  listFiles(req, res) {
    const files = [];
    const entries = fs.readdirSync(FILES_DIR);
    for (const entry of entries) {
      if (entry === '.gitkeep' || entry.endsWith('.meta.json')) continue;
      const filePath = path.join(FILES_DIR, entry);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      // 读取元数据
      const metaPath = filePath + '.meta.json';
      let meta = {};
      if (fs.existsSync(metaPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        } catch {
          // 忽略损坏的元数据
        }
      }

      files.push({
        fileName: meta.originalName || entry,
        storedName: entry,
        fileHash: meta.fileHash || path.parse(entry).name,
        fileSize: stat.size,
        uploadedAt: meta.uploadedAt || stat.mtime.toISOString()
      });
    }

    // 按上传时间倒序
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      code: 200,
      data: files,
      message: '查询成功'
    });
  },

  // GET /api/upload/download/:storedName — 下载文件
  download(req, res) {
    const { storedName } = req.params;
    const filePath = path.join(FILES_DIR, storedName);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在'
      });
    }

    // 读取原始文件名
    const metaPath = filePath + '.meta.json';
    let downloadName = storedName;
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        downloadName = meta.originalName || storedName;
      } catch {
        // 使用存储名
      }
    }

    res.download(filePath, downloadName);
  },

  // DELETE /api/upload/files/:storedName — 删除文件
  deleteFile(req, res) {
    const { storedName } = req.params;
    const filePath = path.join(FILES_DIR, storedName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在'
      });
    }

    fs.unlinkSync(filePath);
    const metaPath = filePath + '.meta.json';
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }

    res.json({
      code: 200,
      data: null,
      message: '删除成功'
    });
  }
};

module.exports = uploadController;
