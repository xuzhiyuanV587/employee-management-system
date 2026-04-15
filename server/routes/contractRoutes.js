const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getUploadsDir } = require('../config/paths');
const contractController = require('../controllers/contractController');

const upload = multer({
  dest: path.join(getUploadsDir(), 'temp'),
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.docx' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('只支持 .docx 文件格式'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 上传模板
router.post('/upload', upload.single('file'), contractController.upload);

// 模板列表
router.get('/', contractController.list);

// 单条记录详情（放在 /:id 前面）
router.get('/records/:recordId', contractController.recordDetail);

// 下载已填写合同
router.get('/records/:recordId/download', contractController.downloadRecord);

// 删除使用记录
router.delete('/records/:recordId', contractController.removeRecord);

// 模板详情
router.get('/:id', contractController.detail);

// 删除模板
router.delete('/:id', contractController.remove);

// 重新识别空白项
router.post('/:id/reparse', contractController.reparse);

// 填写合同
router.post('/:id/fill', contractController.fill);

// 模板使用记录
router.get('/:id/records', contractController.records);

module.exports = router;
