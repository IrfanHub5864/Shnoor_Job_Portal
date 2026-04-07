-- Create all tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK(role IN ('admin', 'superadmin', 'manager', 'user')) DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_photo_url TEXT,
  display_name VARCHAR(120),
  headline VARCHAR(180),
  basic_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  education_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  internships JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  subsets JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  accomplishments JSONB NOT NULL DEFAULT '{}'::jsonb,
  extra_curricular_activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  industry VARCHAR(50),
  location VARCHAR(100),
  status VARCHAR(50) CHECK(status IN ('pending', 'approved', 'rejected', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  apply_mode VARCHAR(50) DEFAULT 'direct_profile',
  predefined_form_key VARCHAR(80),
  custom_form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  google_form_url TEXT,
  manager_instructions TEXT,
  status VARCHAR(50) CHECK(status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  apply_source VARCHAR(50) DEFAULT 'direct_profile',
  submitted_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) CHECK(status IN ('applied', 'selected', 'rejected')) DEFAULT 'applied',
  test_attempted BOOLEAN DEFAULT FALSE,
  test_score DECIMAL(5, 2),
  test_total_questions INTEGER DEFAULT 10,
  test_passed BOOLEAN DEFAULT FALSE,
  test_submitted_at TIMESTAMP,
  interview_called BOOLEAN DEFAULT FALSE,
  interview_called_at TIMESTAMP,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_name VARCHAR(50),
  price DECIMAL(10, 2),
  job_slots INTEGER,
  status VARCHAR(50) CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP
);

CREATE TABLE otp_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manager_test_links (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  candidate_email VARCHAR(100),
  link_url TEXT NOT NULL,
  notes TEXT,
  link_status VARCHAR(50) CHECK(link_status IN ('pending', 'sent', 'completed', 'expired')) DEFAULT 'pending',
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

CREATE TABLE manager_test_link_updates (
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

CREATE TABLE manager_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(30),
  department VARCHAR(120),
  bio TEXT,
  photo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manager_interviews (
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

CREATE TABLE manager_interview_updates (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES manager_interviews(id) ON DELETE CASCADE,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  candidate_email VARCHAR(100),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  message TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manager_offboarding_letters (
  id SERIAL PRIMARY KEY,
  candidate_email VARCHAR(100) NOT NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'sent',
  notes TEXT,
  sent_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_manager_test_links_job_id ON manager_test_links(job_id);
CREATE INDEX idx_manager_test_links_application_id ON manager_test_links(application_id);
CREATE INDEX idx_manager_test_link_updates_test_link_id ON manager_test_link_updates(test_link_id);
CREATE INDEX idx_manager_profiles_user_id ON manager_profiles(user_id);
CREATE INDEX idx_manager_interviews_job_id ON manager_interviews(job_id);
CREATE INDEX idx_manager_interview_updates_interview_id ON manager_interview_updates(interview_id);
CREATE INDEX idx_manager_offboarding_job_id ON manager_offboarding_letters(job_id);

-- Insert admin user
INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'admin@hirehub.com', '$2b$10$Capc9Pa2mw7Ad4CG2qj1hOl2n7KkLKZxCiGypbWeRo/qNF.QFkpJm', 'superadmin');

-- Insert manager user (password: Manager12)
INSERT INTO users (name, email, password, role) VALUES
('Portal Manager', 'manager@hirehub.com', '$2b$10$tjv/DCqxM6Hc4gCxymyOyOyqlYKPyvGVTiy8R/x7o4BvjCd1AMyju', 'manager');
