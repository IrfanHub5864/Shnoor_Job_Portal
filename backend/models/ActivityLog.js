const pool = require('../config/database');

class ActivityLog {
  static async record(action, entityType, entityId) {
    const query = `INSERT INTO activity_logs (action, entity_type, entity_id)
                   VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(query, [action, entityType, entityId]);
    return result.rows[0];
  }

  static async getAll(entityFilter = 'all') {
    const filters = {
      all: {
        where: '',
        values: [],
      },
      user: {
        where: 'WHERE entity_type = $1',
        values: ['user'],
      },
      company: {
        where: 'WHERE entity_type = $1',
        values: ['company'],
      },
      company_manager: {
        where: `WHERE entity_type = 'user'
                AND EXISTS (
                  SELECT 1
                  FROM users u
                  WHERE u.id = activity_logs.entity_id
                    AND u.role = 'company_manager'
                )`,
        values: [],
      },
    };

    const selected = filters[entityFilter] || filters.all;
    const query = `SELECT id, action, entity_type, entity_id, created_at
                   FROM activity_logs
                   ${selected.where}
                   ORDER BY created_at DESC, id DESC`;
    const result = await pool.query(query, selected.values);
    return result.rows;
  }
}

module.exports = ActivityLog;