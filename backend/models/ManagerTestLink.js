const pool = require('../config/database');

class ManagerTestLink {
  static async ensureTables() {
    const query = `
      CREATE TABLE IF NOT EXISTS manager_test_links (
        id SERIAL PRIMARY KEY,
        application_id INT REFERENCES applications(id) ON DELETE SET NULL,
        job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
        candidate_email VARCHAR(100),
        link_url TEXT NOT NULL,
        notes TEXT,
        link_status VARCHAR(50) DEFAULT 'pending',
        pass_percentage DECIMAL(5, 2) DEFAULT 75,
        quiz_question_count INTEGER DEFAULT 10,
        latest_score DECIMAL(5, 2),
        is_passed BOOLEAN DEFAULT FALSE,
        attempted_at TIMESTAMP,
        interview_called BOOLEAN DEFAULT FALSE,
        interview_called_at TIMESTAMP,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        updated_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manager_test_link_updates (
        id SERIAL PRIMARY KEY,
        test_link_id INT NOT NULL REFERENCES manager_test_links(id) ON DELETE CASCADE,
        changed_by INT REFERENCES users(id) ON DELETE SET NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        previous_link TEXT,
        new_link TEXT,
        previous_notes TEXT,
        new_notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_manager_test_links_job_id ON manager_test_links(job_id);
      CREATE INDEX IF NOT EXISTS idx_manager_test_links_application_id ON manager_test_links(application_id);
      CREATE INDEX IF NOT EXISTS idx_manager_test_link_updates_test_link_id ON manager_test_link_updates(test_link_id);

      ALTER TABLE manager_test_links
      ADD COLUMN IF NOT EXISTS pass_percentage DECIMAL(5, 2) DEFAULT 75,
      ADD COLUMN IF NOT EXISTS quiz_question_count INTEGER DEFAULT 10,
      ADD COLUMN IF NOT EXISTS latest_score DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS interview_called BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS interview_called_at TIMESTAMP;
    `;

    await pool.query(query);
  }

  static async getAll() {
    await this.ensureTables();
    const query = `
      SELECT
        tl.id,
        tl.application_id,
        tl.job_id,
        tl.candidate_email,
        tl.link_url,
        tl.notes,
        tl.link_status,
        tl.pass_percentage,
        tl.quiz_question_count,
        tl.latest_score,
        tl.is_passed,
        tl.attempted_at,
        tl.interview_called,
        tl.interview_called_at,
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
    await this.ensureTables();
    const query = `
      INSERT INTO manager_test_links
      (
        application_id,
        job_id,
        candidate_email,
        link_url,
        notes,
        link_status,
        pass_percentage,
        quiz_question_count,
        latest_score,
        is_passed,
        attempted_at,
        interview_called,
        interview_called_at,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
      RETURNING *
    `;
    const values = [
      data.applicationId || null,
      data.jobId || null,
      data.candidateEmail || null,
      data.linkUrl,
      data.notes || null,
      data.linkStatus || 'pending',
      Number(data.passPercentage) || 75,
      Number(data.quizQuestionCount) || 10,
      data.latestScore !== undefined && data.latestScore !== null ? Number(data.latestScore) : null,
      Boolean(data.isPassed),
      data.attemptedAt || null,
      Boolean(data.interviewCalled),
      data.interviewCalledAt || null,
      userId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getLatestByApplicationId(applicationId) {
    await this.ensureTables();
    const query = `
      SELECT *
      FROM manager_test_links
      WHERE application_id = $1
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  }

  static async getById(id) {
    await this.ensureTables();
    const query = 'SELECT * FROM manager_test_links WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data, userId) {
    await this.ensureTables();
    const query = `
      UPDATE manager_test_links
      SET
        application_id = COALESCE($1, application_id),
        job_id = COALESCE($2, job_id),
        candidate_email = COALESCE($3, candidate_email),
        link_url = COALESCE($4, link_url),
        notes = COALESCE($5, notes),
        link_status = COALESCE($6, link_status),
        pass_percentage = COALESCE($7, pass_percentage),
        quiz_question_count = COALESCE($8, quiz_question_count),
        latest_score = COALESCE($9, latest_score),
        is_passed = COALESCE($10, is_passed),
        attempted_at = COALESCE($11, attempted_at),
        interview_called = COALESCE($12, interview_called),
        interview_called_at = COALESCE($13, interview_called_at),
        updated_by = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `;
    const values = [
      data.applicationId !== undefined ? data.applicationId : null,
      data.jobId !== undefined ? data.jobId : null,
      data.candidateEmail !== undefined ? data.candidateEmail : null,
      data.linkUrl !== undefined ? data.linkUrl : null,
      data.notes !== undefined ? data.notes : null,
      data.linkStatus !== undefined ? data.linkStatus : null,
      data.passPercentage !== undefined ? Number(data.passPercentage) : null,
      data.quizQuestionCount !== undefined ? Number(data.quizQuestionCount) : null,
      data.latestScore !== undefined && data.latestScore !== null ? Number(data.latestScore) : null,
      data.isPassed !== undefined ? Boolean(data.isPassed) : null,
      data.attemptedAt !== undefined ? data.attemptedAt : null,
      data.interviewCalled !== undefined ? Boolean(data.interviewCalled) : null,
      data.interviewCalledAt !== undefined ? data.interviewCalledAt : null,
      userId,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createUpdateLog(testLinkId, previous, updated, userId) {
    await this.ensureTables();
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
    await this.ensureTables();
    const query = `
      SELECT
        u.id,
        u.test_link_id,
        tl.candidate_email,
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
      LEFT JOIN manager_test_links tl ON tl.id = u.test_link_id
      LEFT JOIN users usr ON usr.id = u.changed_by
      ORDER BY u.updated_at DESC, u.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getForUser(userId, email) {
    await this.ensureTables();
    const query = `
      SELECT
        tl.id,
        tl.application_id,
        tl.job_id,
        tl.candidate_email,
        tl.link_url,
        tl.notes,
        tl.link_status,
        tl.pass_percentage,
        tl.quiz_question_count,
        tl.latest_score,
        tl.is_passed,
        tl.attempted_at,
        tl.interview_called,
        tl.interview_called_at,
        tl.created_at,
        tl.updated_at,
        j.title AS job_title,
        c.name AS company_name,
        a.status AS application_status
      FROM manager_test_links tl
      LEFT JOIN applications a ON a.id = tl.application_id
      LEFT JOIN jobs j ON j.id = COALESCE(tl.job_id, a.job_id)
      LEFT JOIN companies c ON c.id = j.company_id
      WHERE a.user_id = $1
        OR (LOWER(COALESCE(tl.candidate_email, '')) = LOWER(COALESCE($2, '')))
      ORDER BY tl.updated_at DESC, tl.id DESC
    `;
    const result = await pool.query(query, [userId, email || null]);
    return result.rows;
  }
}

module.exports = ManagerTestLink;
