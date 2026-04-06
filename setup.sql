-- Create all tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK(role IN ('admin', 'manager', 'superadmin')) DEFAULT 'admin',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  status VARCHAR(50) CHECK(status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK(status IN ('applied', 'selected', 'rejected')) DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_manager_test_links_job_id ON manager_test_links(job_id);
CREATE INDEX idx_manager_test_links_application_id ON manager_test_links(application_id);
CREATE INDEX idx_manager_test_link_updates_test_link_id ON manager_test_link_updates(test_link_id);

-- Insert admin user
INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'admin@hirehub.com', '$2b$10$Capc9Pa2mw7Ad4CG2qj1hOl2n7KkLKZxCiGypbWeRo/qNF.QFkpJm', 'superadmin');

-- Insert manager user (password: Manager12)
INSERT INTO users (name, email, password, role) VALUES
('Portal Manager', 'manager@hirehub.com', '$2b$10$tjv/DCqxM6Hc4gCxymyOyOyqlYKPyvGVTiy8R/x7o4BvjCd1AMyju', 'manager');
