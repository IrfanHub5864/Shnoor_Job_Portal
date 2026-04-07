BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS owner_id INTEGER,
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE companies
  ALTER COLUMN phone TYPE VARCHAR(50);

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS apply_mode VARCHAR(50) DEFAULT 'direct_profile',
  ADD COLUMN IF NOT EXISTS predefined_form_key VARCHAR(80),
  ADD COLUMN IF NOT EXISTS custom_form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS google_form_url TEXT,
  ADD COLUMN IF NOT EXISTS manager_instructions TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS apply_source VARCHAR(50) DEFAULT 'direct_profile',
  ADD COLUMN IF NOT EXISTS submitted_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS test_attempted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS test_score DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS test_total_questions INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS test_passed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS test_submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS interview_called BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS interview_called_at TIMESTAMP;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS platform_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS company_email VARCHAR(100),
  ADD COLUMN IF NOT EXISTS company_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address TEXT;

CREATE TABLE IF NOT EXISTS otp_verification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_test_links (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
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
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE manager_test_links
  ADD COLUMN IF NOT EXISTS pass_percentage DECIMAL(5, 2) DEFAULT 75,
  ADD COLUMN IF NOT EXISTS quiz_question_count INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS latest_score DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS interview_called BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS interview_called_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS manager_test_link_updates (
  id SERIAL PRIMARY KEY,
  test_link_id INTEGER NOT NULL REFERENCES manager_test_links(id) ON DELETE CASCADE,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  previous_link TEXT,
  new_link TEXT,
  previous_notes TEXT,
  new_notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(30),
  department VARCHAR(120),
  bio TEXT,
  photo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_interviews (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  candidate_email VARCHAR(100) NOT NULL,
  interview_type VARCHAR(50) NOT NULL,
  interviewer_name VARCHAR(100),
  scheduled_at TIMESTAMP NOT NULL,
  mode VARCHAR(80),
  meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_interview_updates (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES manager_interviews(id) ON DELETE CASCADE,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  candidate_email VARCHAR(100),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  message TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_offboarding_letters (
  id SERIAL PRIMARY KEY,
  candidate_email VARCHAR(100) NOT NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'sent',
  notes TEXT,
  sent_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_verification_user_id ON otp_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_manager_test_links_job_id ON manager_test_links(job_id);
CREATE INDEX IF NOT EXISTS idx_manager_test_links_application_id ON manager_test_links(application_id);
CREATE INDEX IF NOT EXISTS idx_manager_test_link_updates_test_link_id ON manager_test_link_updates(test_link_id);
CREATE INDEX IF NOT EXISTS idx_manager_profiles_user_id ON manager_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_manager_interviews_job_id ON manager_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_manager_interview_updates_interview_id ON manager_interview_updates(interview_id);
CREATE INDEX IF NOT EXISTS idx_manager_offboarding_job_id ON manager_offboarding_letters(job_id);

COMMIT;
