const pool = require('../config/database');

class ManagerTestLink {
  static async getAll() {
    const query = `
      SELECT
        tl.id,
        tl.application_id,
        tl.job_id,
        tl.candidate_email,
        tl.link_url,
        tl.notes,
        tl.link_status,
        tl.created_at,
        tl.updated_at,
        j.title AS job_title,
        a.status AS application_status
      FROM manager_test_links tl
      LEFT JOIN jobs j ON j.id = tl.job_id
      LEFT JOIN applications a ON a.id = tl.application_id
      ORDER BY tl.updated_at DESC, tl.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(data, userId) {
    const query = `
      INSERT INTO manager_test_links
      (application_id, job_id, candidate_email, link_url, notes, link_status, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING *
    `;
    const values = [
      data.applicationId || null,
      data.jobId || null,
      data.candidateEmail || null,
      data.linkUrl,
      data.notes || null,
      data.linkStatus || 'pending',
      userId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getById(id) {
    const query = 'SELECT * FROM manager_test_links WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data, userId) {
    const query = `
      UPDATE manager_test_links
      SET
        application_id = COALESCE($1, application_id),
        job_id = COALESCE($2, job_id),
        candidate_email = COALESCE($3, candidate_email),
        link_url = COALESCE($4, link_url),
        notes = COALESCE($5, notes),
        link_status = COALESCE($6, link_status),
        updated_by = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      data.applicationId || null,
      data.jobId || null,
      data.candidateEmail || null,
      data.linkUrl || null,
      data.notes || null,
      data.linkStatus || null,
      userId,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createUpdateLog(testLinkId, previous, updated, userId) {
    const query = `
      INSERT INTO manager_test_link_updates
      (test_link_id, changed_by, previous_status, new_status, previous_link, new_link, previous_notes, new_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      testLinkId,
      userId,
      previous.link_status,
      updated.link_status,
      previous.link_url,
      updated.link_url,
      previous.notes,
      updated.notes
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getUpdates() {
    const query = `
      SELECT
        u.id,
        u.test_link_id,
        u.previous_status,
        u.new_status,
        u.previous_link,
        u.new_link,
        u.previous_notes,
        u.new_notes,
        u.updated_at,
        usr.name AS changed_by_name,
        usr.email AS changed_by_email
      FROM manager_test_link_updates u
      LEFT JOIN users usr ON usr.id = u.changed_by
      ORDER BY u.updated_at DESC, u.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = ManagerTestLink;
