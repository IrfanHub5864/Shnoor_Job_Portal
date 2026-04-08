const pool = require('../config/database');

class ManagerWorkflow {
  static async syncSequences() {
    await pool.query(`
      SELECT setval(
        pg_get_serial_sequence('manager_profiles', 'id'),
        COALESCE((SELECT MAX(id) FROM manager_profiles), 0) + 1,
        false
      );

      SELECT setval(
        pg_get_serial_sequence('manager_interviews', 'id'),
        COALESCE((SELECT MAX(id) FROM manager_interviews), 0) + 1,
        false
      );

      SELECT setval(
        pg_get_serial_sequence('manager_interview_updates', 'id'),
        COALESCE((SELECT MAX(id) FROM manager_interview_updates), 0) + 1,
        false
      );

      SELECT setval(
        pg_get_serial_sequence('manager_offboarding_letters', 'id'),
        COALESCE((SELECT MAX(id) FROM manager_offboarding_letters), 0) + 1,
        false
      );
    `);
  }

  static async ensureTables() {
    const query = `
      CREATE TABLE IF NOT EXISTS manager_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phone VARCHAR(30),
        department VARCHAR(120),
        bio TEXT,
        photo_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manager_interviews (
        id SERIAL PRIMARY KEY,
        job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
        candidate_email VARCHAR(100) NOT NULL,
        interview_type VARCHAR(50) NOT NULL,
        interviewer_name VARCHAR(100),
        scheduled_at TIMESTAMP NOT NULL,
        mode VARCHAR(80),
        meeting_link TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        updated_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manager_interview_updates (
        id SERIAL PRIMARY KEY,
        interview_id INT NOT NULL REFERENCES manager_interviews(id) ON DELETE CASCADE,
        updated_by INT REFERENCES users(id) ON DELETE SET NULL,
        candidate_email VARCHAR(100),
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manager_offboarding_letters (
        id SERIAL PRIMARY KEY,
        candidate_email VARCHAR(100) NOT NULL,
        job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'sent',
        notes TEXT,
        sent_by INT REFERENCES users(id) ON DELETE SET NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_manager_profiles_user_id ON manager_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_manager_interviews_job_id ON manager_interviews(job_id);
      CREATE INDEX IF NOT EXISTS idx_manager_interview_updates_interview_id ON manager_interview_updates(interview_id);
      CREATE INDEX IF NOT EXISTS idx_manager_offboarding_job_id ON manager_offboarding_letters(job_id);
    `;

    await pool.query(query);
    await this.syncSequences();
  }

  static async getManagerProfile(user) {
    await this.ensureTables();
    const result = await pool.query('SELECT phone, department, bio, photo_url FROM manager_profiles WHERE user_id = $1', [user.id]);
    const profile = result.rows[0] || {};

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_blocked: user.is_blocked,
      phone: profile.phone || '',
      department: profile.department || '',
      bio: profile.bio || '',
      photo_url: profile.photo_url || ''
    };
  }

  static async updateManagerProfile(userId, data) {
    await this.ensureTables();

    const query = `
      INSERT INTO manager_profiles (user_id, phone, department, bio, photo_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        phone = EXCLUDED.phone,
        department = EXCLUDED.department,
        bio = EXCLUDED.bio,
        photo_url = EXCLUDED.photo_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      userId,
      data.phone || '',
      data.department || '',
      data.bio || '',
      data.photo_url || ''
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createInterview(data, userId) {
    await this.ensureTables();
    const query = `
      INSERT INTO manager_interviews
      (job_id, candidate_email, interview_type, interviewer_name, scheduled_at, mode, meeting_link, status, notes, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled', $8, $9, $9)
      RETURNING *;
    `;
    const values = [
      data.jobId || null,
      data.candidateEmail,
      data.interviewType,
      data.interviewerName || null,
      data.scheduledAt,
      data.mode || null,
      data.meetingLink || null,
      data.notes || null,
      userId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getInterviews() {
    await this.ensureTables();
    const query = `
      SELECT
        i.*,
        j.title AS job_title
      FROM manager_interviews i
      LEFT JOIN jobs j ON j.id = i.job_id
      ORDER BY i.updated_at DESC, i.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getInterviewById(id) {
    await this.ensureTables();
    const result = await pool.query('SELECT * FROM manager_interviews WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateInterviewStatus(id, status, userId) {
    await this.ensureTables();
    const query = `
      UPDATE manager_interviews
      SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, userId, id]);
    return result.rows[0];
  }

  static async createInterviewUpdate(data) {
    await this.ensureTables();
    const query = `
      INSERT INTO manager_interview_updates
      (interview_id, updated_by, candidate_email, previous_status, new_status, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      data.interviewId,
      data.updatedBy,
      data.candidateEmail || null,
      data.previousStatus || null,
      data.newStatus || null,
      data.message || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getInterviewUpdates() {
    await this.ensureTables();
    const query = `
      SELECT
        u.*,
        usr.name AS updated_by_name,
        usr.email AS updated_by_email
      FROM manager_interview_updates u
      LEFT JOIN users usr ON usr.id = u.updated_by
      ORDER BY u.updated_at DESC, u.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async createOffboardingLetter(data, userId) {
    await this.ensureTables();
    const query = `
      INSERT INTO manager_offboarding_letters
      (candidate_email, job_id, status, notes, sent_by)
      VALUES ($1, $2, 'sent', $3, $4)
      RETURNING *;
    `;
    const values = [data.candidateEmail, data.jobId || null, data.notes || null, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getOffboardingLetters() {
    await this.ensureTables();
    const query = `
      SELECT
        o.*,
        j.title AS job_title
      FROM manager_offboarding_letters o
      LEFT JOIN jobs j ON j.id = o.job_id
      ORDER BY o.sent_at DESC, o.id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = ManagerWorkflow;
