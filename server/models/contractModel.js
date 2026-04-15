const { db } = require('../config/database');

const ContractModel = {
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO contract_templates (name, original_filename, file_path, placeholders, placeholder_rule, custom_pattern, upload_by)
      VALUES (@name, @original_filename, @file_path, @placeholders, @placeholder_rule, @custom_pattern, @upload_by)
    `);
    const result = stmt.run({
      name: data.name,
      original_filename: data.original_filename,
      file_path: data.file_path,
      placeholders: JSON.stringify(data.placeholders || []),
      placeholder_rule: data.placeholder_rule || 'underscore',
      custom_pattern: data.custom_pattern || null,
      upload_by: data.upload_by || null,
    });
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    const row = db.prepare(
      'SELECT * FROM contract_templates WHERE id = ? AND deleted_at IS NULL'
    ).get(id);
    if (row) row.placeholders = JSON.parse(row.placeholders);
    return row;
  },

  findAll({ page = 1, pageSize = 10, keyword = '' } = {}) {
    const offset = (page - 1) * pageSize;
    const params = {
      keyword: `%${keyword}%`,
      limit: pageSize,
      offset
    };

    const whereSQL = 'WHERE deleted_at IS NULL AND name LIKE @keyword';
    const { total } = db.prepare(
      `SELECT COUNT(*) as total FROM contract_templates ${whereSQL}`
    ).get(params);

    const list = db.prepare(`
      SELECT * FROM contract_templates
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT @limit OFFSET @offset
    `).all(params).map(item => ({
      ...item,
      placeholders: JSON.parse(item.placeholders)
    }));

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  },

  update(id, data) {
    const fields = [];
    const params = { id };
    const allowedFields = [
      'name',
      'original_filename',
      'file_path',
      'placeholder_rule',
      'custom_pattern',
      'upload_by'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = @${field}`);
        params[field] = data[field];
      }
    }

    if (data.placeholders !== undefined) {
      fields.push('placeholders = @placeholders');
      params.placeholders = JSON.stringify(data.placeholders);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    db.prepare(
      `UPDATE contract_templates SET ${fields.join(', ')} WHERE id = @id AND deleted_at IS NULL`
    ).run(params);
    return this.findById(id);
  },

  softDelete(id) {
    return db.prepare(
      'UPDATE contract_templates SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL'
    ).run(id);
  },

  createRecord(data) {
    const stmt = db.prepare(`
      INSERT INTO contract_records (template_id, fill_data, filled_by, file_path)
      VALUES (@template_id, @fill_data, @filled_by, @file_path)
    `);
    const result = stmt.run({
      template_id: data.template_id,
      fill_data: JSON.stringify(data.fill_data || {}),
      filled_by: data.filled_by || null,
      file_path: data.file_path || null
    });
    return this.getRecordById(result.lastInsertRowid);
  },

  getRecords(templateId, { page = 1, pageSize = 10 } = {}) {
    const offset = (page - 1) * pageSize;
    const params = { templateId, limit: pageSize, offset };
    const { total } = db.prepare(
      'SELECT COUNT(*) as total FROM contract_records WHERE template_id = @templateId'
    ).get(params);
    const list = db.prepare(`
      SELECT * FROM contract_records
      WHERE template_id = @templateId
      ORDER BY created_at DESC
      LIMIT @limit OFFSET @offset
    `).all(params).map(item => ({
      ...item,
      fill_data: JSON.parse(item.fill_data)
    }));

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  },

  deleteRecord(recordId) {
    return db.prepare('DELETE FROM contract_records WHERE id = ?').run(recordId);
  },

  getRecordById(recordId) {
    const row = db.prepare('SELECT * FROM contract_records WHERE id = ?').get(recordId);
    if (row) {
      row.fill_data = JSON.parse(row.fill_data);
    }
    return row;
  }
};

module.exports = ContractModel;
