const ContractModel = require('../models/contractModel');
const { parsePlaceholders, fillDocument } = require('../utils/docx-parser');
const { getUploadsDir } = require('../config/paths');
const path = require('path');
const fs = require('fs');

const contractController = {
  upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 400, message: '请上传文件' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ code: 400, message: '请提供模板名称' });
      }

      // multer 对中文文件名使用 latin1 编码，需要转换为 utf8
      const originalFilename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

      const contractsDir = path.join(getUploadsDir(), 'contracts');
      if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${originalFilename}`;
      const filePath = path.join(contractsDir, filename);
      fs.renameSync(req.file.path, filePath);

      const placeholders = parsePlaceholders(filePath, 'underscore');

      const template = ContractModel.create({
        name,
        original_filename: originalFilename,
        file_path: filePath,
        placeholders,
        placeholder_rule: 'underscore',
        upload_by: req.user?.username
      });

      res.status(201).json({ code: 201, data: template, message: '上传成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '上传失败', error: err.message });
    }
  },

  list(req, res) {
    try {
      const { page, pageSize, keyword } = req.query;
      const result = ContractModel.findAll({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        keyword: keyword || ''
      });
      res.json({ code: 200, data: result, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  detail(req, res) {
    try {
      const template = ContractModel.findById(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ code: 404, message: '模板不存在' });
      }
      res.json({ code: 200, data: template, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  remove(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = ContractModel.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: '模板不存在' });
      }

      ContractModel.softDelete(id);
      res.json({ code: 200, message: '删除成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '删除失败', error: err.message });
    }
  },

  reparse(req, res) {
    try {
      const id = parseInt(req.params.id);
      const template = ContractModel.findById(id);
      if (!template) {
        return res.status(404).json({ code: 404, message: '模板不存在' });
      }

      const { placeholder_rule, custom_pattern } = req.body;
      const rule = placeholder_rule || 'underscore';

      const placeholders = parsePlaceholders(template.file_path, rule, custom_pattern);

      const updated = ContractModel.update(id, {
        placeholders,
        placeholder_rule: rule,
        custom_pattern: custom_pattern || null
      });

      res.json({ code: 200, data: updated, message: '重新识别成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '重新识别失败', error: err.message });
    }
  },

  fill(req, res) {
    try {
      const id = parseInt(req.params.id);
      const template = ContractModel.findById(id);
      if (!template) {
        return res.status(404).json({ code: 404, message: '模板不存在' });
      }

      const { fill_data } = req.body;
      if (!fill_data) {
        return res.status(400).json({ code: 400, message: '请提供填写数据' });
      }

      const placeholders = Array.isArray(template.placeholders) ? template.placeholders : [];
      const normalizedFillData = {};
      for (const placeholder of placeholders) {
        normalizedFillData[placeholder.key] = {
          label: placeholder.label,
          value: fill_data[placeholder.key] ?? ''
        };
      }

      const filledDir = path.join(getUploadsDir(), 'contracts', 'filled');
      if (!fs.existsSync(filledDir)) {
        fs.mkdirSync(filledDir, { recursive: true });
      }

      const filename = `filled-${Date.now()}-${template.original_filename}`;
      const outputPath = path.join(filledDir, filename);

      fillDocument(
        template.file_path,
        outputPath,
        normalizedFillData,
        template.placeholder_rule,
        template.custom_pattern
      );

      const record = ContractModel.createRecord({
        template_id: id,
        fill_data,
        filled_by: req.user?.username,
        file_path: outputPath
      });

      res.status(201).json({ code: 201, data: record, message: '填写成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '填写失败', error: err.message });
    }
  },

  records(req, res) {
    try {
      const templateId = parseInt(req.params.id);
      const { page, pageSize } = req.query;
      const result = ContractModel.getRecords(templateId, {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10
      });
      res.json({ code: 200, data: result, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  recordDetail(req, res) {
    try {
      const recordId = parseInt(req.params.recordId);
      const record = ContractModel.getRecordById(recordId);
      if (!record) {
        return res.status(404).json({ code: 404, message: '记录不存在' });
      }
      res.json({ code: 200, data: record, message: '查询成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询失败', error: err.message });
    }
  },

  removeRecord(req, res) {
    try {
      const recordId = parseInt(req.params.recordId);
      const record = ContractModel.getRecordById(recordId);
      if (!record) {
        return res.status(404).json({ code: 404, message: '记录不存在' });
      }

      if (record.file_path && fs.existsSync(record.file_path)) {
        fs.unlinkSync(record.file_path);
      }

      ContractModel.deleteRecord(recordId);
      res.json({ code: 200, message: '删除成功' });
    } catch (err) {
      res.status(500).json({ code: 500, message: '删除失败', error: err.message });
    }
  },

  downloadRecord(req, res) {
    try {
      const recordId = parseInt(req.params.recordId);
      const record = ContractModel.getRecordById(recordId);
      if (!record) {
        return res.status(404).json({ code: 404, message: '记录不存在' });
      }

      if (!record.file_path || !fs.existsSync(record.file_path)) {
        return res.status(404).json({ code: 404, message: '文件不存在' });
      }

      res.download(record.file_path);
    } catch (err) {
      res.status(500).json({ code: 500, message: '下载失败', error: err.message });
    }
  }
};

module.exports = contractController;
