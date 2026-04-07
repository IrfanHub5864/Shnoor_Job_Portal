const pool = require('../config/database');

class Settings {
  static async getSettings() {
    const query = 'SELECT * FROM settings LIMIT 1';
    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  static async updateSettings(platformName, logoUrl, companyEmail, companyPhone, address) {
    const query = `UPDATE settings SET platform_name = $1, logo_url = $2, company_email = $3, 
                   company_phone = $4, address = $5, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = (SELECT id FROM settings LIMIT 1) RETURNING *`;
    const result = await pool.query(query, [platformName, logoUrl, companyEmail, companyPhone, address]);
    return result.rows[0];
  }

  static async initializeSettings() {
    const query = `INSERT INTO settings (platform_name, company_email) 
                   VALUES ($1, $2) 
                   ON CONFLICT (id) DO NOTHING RETURNING *`;
    const result = await pool.query(query, ['Shnoor Job Portal', 'support@shnoorjobportal.com']);
    return result.rows[0];
  }
}

module.exports = Settings;
