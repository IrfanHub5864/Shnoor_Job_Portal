const pool = require('../config/database');

class ActivityLog {
  static async ensureTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(150) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE activity_logs
      ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

      CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    `;

    await pool.query(query);
  }

  static async record(action, entityType, entityId, metadata = {}) {
    await this.ensureTable();
    const query = `INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
                   VALUES ($1, $2, $3, $4::jsonb) RETURNING *`;
    const result = await pool.query(query, [action, entityType, entityId, JSON.stringify(metadata || {})]);
    return result.rows[0];
  }

  static async getAll(entityType = 'all') {
    await this.ensureTable();

    let query = `SELECT id, action, entity_type, entity_id, metadata, created_at
                 FROM activity_logs`;
    const values = [];

    if (entityType && entityType !== 'all') {
      query += ' WHERE entity_type = $1';
      values.push(entityType);
    }

    query += ' ORDER BY created_at DESC, id DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = ActivityLog;
