const pool = require('../config/database');

class Company {
  static async create(name, ownerId, email, phone, website, description) {
    const query = `INSERT INTO companies (name, owner_id, email, phone, website, description, status) 
                   VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`;
    const result = await pool.query(query, [name, ownerId, email, phone, website, description]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `SELECT c.*, u.email as owner_email, u.name as owner_name, u.role as owner_role FROM companies c 
                   LEFT JOIN users u ON c.owner_id = u.id`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `SELECT c.*, u.email as owner_email, u.name as owner_name, u.role as owner_role FROM companies c 
                   LEFT JOIN users u ON c.owner_id = u.id WHERE c.id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getDetailById(id) {
    const companyQuery = `SELECT c.*, u.email as owner_email, u.name as owner_name, u.role as owner_role FROM companies c 
                          LEFT JOIN users u ON c.owner_id = u.id WHERE c.id = $1`;
    const companyResult = await pool.query(companyQuery, [id]);

    if (!companyResult.rows[0]) {
      return null;
    }

    const subscriptionQuery = `SELECT plan_name, amount, status, start_date, expiry_date
                               FROM subscriptions
                               WHERE company_id = $1
                   ORDER BY start_date DESC, id DESC
                               LIMIT 1`;
    const jobsQuery = `SELECT j.*, COUNT(a.id)::int AS applications_count
                       FROM jobs j
                       LEFT JOIN applications a ON a.job_id = j.id
                       WHERE j.company_id = $1
                       GROUP BY j.id
                       ORDER BY j.created_at DESC, j.id DESC`;
    const statsQuery = `SELECT
                          COUNT(DISTINCT j.id)::int AS total_jobs_posted,
                          COUNT(a.id)::int AS total_applications_received
                        FROM jobs j
                        LEFT JOIN applications a ON a.job_id = j.id
                        WHERE j.company_id = $1`;

    const [subscriptionResult, jobsResult, statsResult] = await Promise.all([
      pool.query(subscriptionQuery, [id]),
      pool.query(jobsQuery, [id]),
      pool.query(statsQuery, [id])
    ]);

    return {
      company: companyResult.rows[0],
      subscription: subscriptionResult.rows[0] || null,
      jobs: jobsResult.rows,
      stats: statsResult.rows[0] || { total_jobs_posted: 0, total_applications_received: 0 }
    };
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE companies SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM companies WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Company;
