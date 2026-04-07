-- Create Database
CREATE DATABASE job_portal;

-- Connect to the database
\c job_portal;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table (Superset style profile sections)
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Companies Table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INT NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  email VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  location VARCHAR(100),
  apply_mode VARCHAR(50) DEFAULT 'direct_profile',
  predefined_form_key VARCHAR(80),
  custom_form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  google_form_url TEXT,
  manager_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id),
  user_id INT NOT NULL REFERENCES users(id),
  apply_source VARCHAR(50) DEFAULT 'direct_profile',
  submitted_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'applied',
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

-- Subscriptions Table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id),
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Verification Table
CREATE TABLE otp_verification (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  otp VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Settings Table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  platform_name VARCHAR(255) DEFAULT 'HireHub',
  logo_url TEXT,
  company_email VARCHAR(100),
  company_phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager Test Links Table
CREATE TABLE manager_test_links (
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

-- Manager Test Link Update History
CREATE TABLE manager_test_link_updates (
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

-- Manager Profile Table
CREATE TABLE manager_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(30),
  department VARCHAR(120),
  bio TEXT,
  photo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager Interviews Table
CREATE TABLE manager_interviews (
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

-- Manager Interview Updates Table
CREATE TABLE manager_interview_updates (
  id SERIAL PRIMARY KEY,
  interview_id INT NOT NULL REFERENCES manager_interviews(id) ON DELETE CASCADE,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  candidate_email VARCHAR(100),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  message TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager Offboarding Letters Table
CREATE TABLE manager_offboarding_letters (
  id SERIAL PRIMARY KEY,
  candidate_email VARCHAR(100) NOT NULL,
  job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'sent',
  notes TEXT,
  sent_by INT REFERENCES users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_otp_user_id ON otp_verification(user_id);
CREATE INDEX idx_manager_test_links_job_id ON manager_test_links(job_id);
CREATE INDEX idx_manager_test_links_application_id ON manager_test_links(application_id);
CREATE INDEX idx_manager_test_link_updates_test_link_id ON manager_test_link_updates(test_link_id);
CREATE INDEX idx_manager_profiles_user_id ON manager_profiles(user_id);
CREATE INDEX idx_manager_interviews_job_id ON manager_interviews(job_id);
CREATE INDEX idx_manager_interview_updates_interview_id ON manager_interview_updates(interview_id);
CREATE INDEX idx_manager_offboarding_job_id ON manager_offboarding_letters(job_id);
