const pool = require('../config/database');

class User {
  static async create(name, email, password, role = 'user') {
    const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(query, [name, email, password, role]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT id, name, email, role, is_blocked, created_at FROM users';
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateBlockStatus(id, isBlocked) {
    const query = 'UPDATE users SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [isBlocked, id]);
    return result.rows[0];
  }
}

module.exports = User;
