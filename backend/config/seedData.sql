-- Seed Data for Job Portal Database
-- Run this after creating the database with database.sql

-- Insert Settings
INSERT INTO settings (platform_name, company_email, company_phone, address)
VALUES ('HireHub', 'admin@hirehub.com', '+1 (555) 123-4567', '123 Business Street, Suite 100, New York, NY 10001')
ON CONFLICT DO NOTHING;

-- Insert Admin User (password: 'admin123')
INSERT INTO users (name, email, password, role)
VALUES ('Super Admin', 'admin@hirehub.com', '$2b$10$Capc9Pa2mw7Ad4CG2qj1hOl2n7KkLKZxCiGypbWeRo/qNF.QFkpJm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Companies
INSERT INTO companies (name, owner_id, email, phone, website, status, description)
VALUES 
  ('Tech Solutions Inc', 1, 'contact@techsolutions.com', '+1 (555) 001-0001', 'https://techsolutions.com', 'approved', 'Leading software development company'),
  ('Design Studio Pro', 1, 'hello@designstudio.com', '+1 (555) 001-0002', 'https://designstudio.com', 'pending', 'Creative design and branding agency'),
  ('Cloud Services Ltd', 1, 'info@cloudservices.com', '+1 (555) 001-0003', 'https://cloudservices.com', 'approved', 'Cloud infrastructure solutions'),
  ('Digital Marketing Agency', 1, 'support@digimarket.com', '+1 (555) 001-0004', 'https://digimarket.com', 'pending', 'Digital marketing and SEO experts')
ON CONFLICT DO NOTHING;

-- Insert Sample Users
INSERT INTO users (name, email, password, role)
VALUES 
  ('John Developer', 'john@example.com', '$2a$10$Y0sH.XH9KGt8V9Z6ZrzM.O7ZI8NxJH9Z6C6V4R3D7Q8F8K6Y9E7Z6', 'admin'),
  ('Sarah Designer', 'sarah@example.com', '$2a$10$Y0sH.XH9KGt8V9Z6ZrzM.O7ZI8NxJH9Z6C6V4R3D7Q8F8K6Y9E7Z6', 'admin'),
  ('Michael Manager', 'michael@example.com', '$2a$10$Y0sH.XH9KGt8V9Z6ZrzM.O7ZI8NxJH9Z6C6V4R3D7Q8F8K6Y9E7Z6', 'admin'),
  ('Portal Manager', 'manager@hirehub.com', '$2b$10$tjv/DCqxM6Hc4gCxymyOyOyqlYKPyvGVTiy8R/x7o4BvjCd1AMyju', 'manager')
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Jobs
INSERT INTO jobs (company_id, title, description, salary_min, salary_max, location, status)
VALUES 
  (1, 'Senior Full Stack Developer', 'Looking for experienced full stack developer', 100000, 150000, 'New York, NY', 'open'),
  (1, 'Frontend Developer', 'React and Vue.js specialist needed', 80000, 120000, 'Remote', 'open'),
  (2, 'UI/UX Designer', 'Creative designer for web and mobile projects', 70000, 100000, 'Los Angeles, CA', 'open'),
  (3, 'Cloud Architect', 'AWS and Azure certification preferred', 120000, 160000, 'San Francisco, CA', 'closed'),
  (4, 'SEO Specialist', 'Digital marketing and SEO expertise', 60000, 90000, 'Chicago, IL', 'open')
ON CONFLICT DO NOTHING;

-- Insert Sample Applications
INSERT INTO applications (job_id, user_id, status)
VALUES 
  (1, 2, 'applied'),
  (1, 3, 'selected'),
  (2, 2, 'applied'),
  (3, 3, 'rejected'),
  (5, 2, 'applied')
ON CONFLICT DO NOTHING;

-- Insert Sample Subscriptions
INSERT INTO subscriptions (company_id, plan_name, amount, payment_date, expiry_date, status)
VALUES 
  (1, 'Pro', 79.00, '2024-01-15', '2024-02-15', 'active'),
  (2, 'Basic', 29.00, '2024-01-10', '2024-02-10', 'active'),
  (3, 'Enterprise', 199.00, '2024-01-01', '2024-04-01', 'active'),
  (4, 'Basic', 29.00, '2023-12-20', '2024-01-20', 'expired')
ON CONFLICT DO NOTHING;

-- Insert Manager Test Links
INSERT INTO manager_test_links (application_id, job_id, candidate_email, link_url, notes, link_status, created_by, updated_by)
VALUES
  (1, 1, 'john@example.com', 'https://tests.hirehub.com/assessment/001', 'Initial coding assessment link', 'sent', 4, 4),
  (2, 1, 'sarah@example.com', 'https://tests.hirehub.com/assessment/002', 'UI review assignment', 'completed', 4, 4)
ON CONFLICT DO NOTHING;
