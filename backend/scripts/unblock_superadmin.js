require('dotenv').config();
const pool = require('../config/database');

async function run() {
  try {
    const updated = await pool.query(
      'UPDATE users SET is_blocked = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING id, email, is_blocked'
    );

    await pool.query(
      "INSERT INTO activity_logs (action, entity_type, entity_id) VALUES ('Unblocked User', 'user', 1)"
    );

    console.log(JSON.stringify(updated.rows, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
