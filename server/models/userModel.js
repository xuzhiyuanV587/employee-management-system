const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

const userModel = {
  getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  getUserById(id) {
    return db.prepare(
      'SELECT id, username, displayName, role, status, created_at, updated_at FROM users WHERE id = ?'
    ).get(id);
  },

  getAllUsers() {
    return db.prepare(
      'SELECT id, username, displayName, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    ).all();
  },

  createUser({ username, password, displayName, role = 'user' }) {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password, displayName, role) VALUES (?, ?, ?, ?)'
    ).run(username, hash, displayName, role);
    return userModel.getUserById(result.lastInsertRowid);
  },

  deleteUser(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },

  updatePassword(id, password) {
    const hash = bcrypt.hashSync(password, 10);
    return db.prepare(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(hash, id);
  },

  updateStatus(id, status) {
    return db.prepare(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, id);
  },

  usernameExists(username) {
    const row = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    return !!row;
  }
};

module.exports = userModel;
