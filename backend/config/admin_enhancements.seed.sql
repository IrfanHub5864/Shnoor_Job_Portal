BEGIN;

INSERT INTO companies (id, name, owner_id, email, phone, website, description, status, created_at, updated_at)
VALUES
  (2, 'Nova Tech Labs', 2, 'hello@novatech.com', '+1 (555) 010-0002', 'https://novatech.com', 'Cloud and AI software studio', 'approved', '2025-10-15 09:00:00', '2025-10-15 09:00:00'),
  (3, 'Vertex Careers', 3, 'contact@vertexcareers.com', '+1 (555) 010-0003', 'https://vertexcareers.com', 'Recruitment and staffing firm', 'pending', '2025-11-01 10:00:00', '2025-11-01 10:00:00'),
  (4, 'BrightPath Digital', 4, 'team@brightpath.com', '+1 (555) 010-0004', 'https://brightpath.com', 'Digital products and UX agency', 'rejected', '2025-12-07 11:30:00', '2025-12-07 11:30:00'),
  (5, 'Summit Cloud Systems', 5, 'info@summitcloud.com', '+1 (555) 010-0005', 'https://summitcloud.com', 'Cloud architecture consultancy', 'blocked', '2026-01-12 12:45:00', '2026-01-12 12:45:00'),
  (6, 'BluePeak Solutions', 6, 'hello@bluepeak.com', '+1 (555) 010-0006', 'https://bluepeak.com', 'Enterprise software delivery', 'approved', '2026-02-18 09:30:00', '2026-02-18 09:30:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, password, role, is_blocked, created_at, updated_at)
VALUES
  (2, 'Ava Patel', 'ava.patel@novatech.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'company_manager', FALSE, '2025-10-01 08:00:00', '2025-10-01 08:00:00'),
  (3, 'Noah Kim', 'noah.kim@vertexcareers.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'company_manager', FALSE, '2025-10-20 08:00:00', '2025-10-20 08:00:00'),
  (4, 'Mia Johnson', 'mia.johnson@brightpath.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'company_manager', TRUE, '2025-11-03 08:00:00', '2025-11-03 08:00:00'),
  (5, 'Ethan Brown', 'ethan.brown@summitcloud.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'company_manager', FALSE, '2025-11-18 08:00:00', '2025-11-18 08:00:00'),
  (6, 'Sophia Wilson', 'sophia.wilson@bluepeak.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'company_manager', FALSE, '2025-12-02 08:00:00', '2025-12-02 08:00:00'),
  (7, 'Liam Davis', 'liam.davis@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', TRUE, '2025-12-15 08:00:00', '2025-12-15 08:00:00'),
  (8, 'Olivia Martinez', 'olivia.martinez@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', FALSE, '2026-01-08 08:00:00', '2026-01-08 08:00:00'),
  (9, 'James Taylor', 'james.taylor@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', FALSE, '2026-01-22 08:00:00', '2026-01-22 08:00:00'),
  (10, 'Isabella Moore', 'isabella.moore@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', FALSE, '2026-02-04 08:00:00', '2026-02-04 08:00:00'),
  (11, 'Benjamin Clark', 'benjamin.clark@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', TRUE, '2026-02-19 08:00:00', '2026-02-19 08:00:00'),
  (12, 'Charlotte Lewis', 'charlotte.lewis@shnoorjobs.com', '$2a$10$u5fy9pSfSrmpywXZoWBohuReJJU65k68pjo0NdQdioVUxx0oHlJXy', 'user', FALSE, '2026-03-05 08:00:00', '2026-03-05 08:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, company_id, title, description, salary_min, salary_max, location, status, created_at, updated_at)
VALUES
  (2, 2, 'Backend Engineer', 'Build scalable APIs and services', 90000, 140000, 'Remote', 'open', '2025-10-16 10:00:00', '2025-10-16 10:00:00'),
  (3, 2, 'Product Designer', 'Design user-first product experiences', 80000, 120000, 'Austin, TX', 'open', '2025-10-25 10:30:00', '2025-10-25 10:30:00'),
  (4, 3, 'Recruitment Specialist', 'Source and screen top talent', 60000, 85000, 'New York, NY', 'closed', '2025-11-04 09:30:00', '2025-11-04 09:30:00'),
  (5, 4, 'Mobile App Developer', 'Create cross-platform mobile apps', 85000, 130000, 'Remote', 'open', '2025-12-08 09:00:00', '2025-12-08 09:00:00'),
  (6, 5, 'Cloud Architect', 'Design secure cloud infrastructure', 120000, 170000, 'San Francisco, CA', 'closed', '2026-01-13 11:00:00', '2026-01-13 11:00:00'),
  (7, 6, 'QA Automation Engineer', 'Automate testing pipelines', 75000, 110000, 'Boston, MA', 'open', '2026-02-19 10:00:00', '2026-02-19 10:00:00'),
  (8, 6, 'Technical Writer', 'Document product features and APIs', 55000, 78000, 'Remote', 'open', '2026-02-25 12:00:00', '2026-02-25 12:00:00'),
  (9, 1, 'Frontend Engineer', 'Build polished React interfaces', 85000, 125000, 'Chicago, IL', 'open', '2026-03-03 09:15:00', '2026-03-03 09:15:00'),
  (10, 1, 'DevOps Engineer', 'Maintain CI/CD and cloud delivery', 95000, 145000, 'Remote', 'closed', '2026-03-15 14:00:00', '2026-03-15 14:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO applications (id, job_id, user_id, status, applied_at, updated_at)
VALUES
  (2, 2, 2, 'applied', '2025-10-18 10:00:00', '2025-10-18 10:00:00'),
  (3, 2, 3, 'selected', '2025-10-21 11:00:00', '2025-10-21 11:00:00'),
  (4, 3, 4, 'rejected', '2025-10-28 12:00:00', '2025-10-28 12:00:00'),
  (5, 4, 5, 'applied', '2025-11-05 13:00:00', '2025-11-05 13:00:00'),
  (6, 5, 6, 'applied', '2025-12-10 09:45:00', '2025-12-10 09:45:00'),
  (7, 5, 7, 'selected', '2025-12-12 15:20:00', '2025-12-12 15:20:00'),
  (8, 6, 8, 'rejected', '2026-01-16 10:30:00', '2026-01-16 10:30:00'),
  (9, 7, 9, 'applied', '2026-02-20 11:00:00', '2026-02-20 11:00:00'),
  (10, 7, 10, 'selected', '2026-02-22 16:00:00', '2026-02-22 16:00:00'),
  (11, 8, 11, 'applied', '2026-02-27 14:00:00', '2026-02-27 14:00:00'),
  (12, 9, 12, 'applied', '2026-03-06 08:30:00', '2026-03-06 08:30:00'),
  (13, 9, 2, 'selected', '2026-03-08 10:15:00', '2026-03-08 10:15:00'),
  (14, 10, 3, 'rejected', '2026-03-18 09:00:00', '2026-03-18 09:00:00'),
  (15, 10, 4, 'applied', '2026-03-20 10:00:00', '2026-03-20 10:00:00'),
  (16, 1, 5, 'applied', '2026-04-01 12:00:00', '2026-04-01 12:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (id, company_id, plan_name, amount, expiry_date, status, start_date, end_date, updated_at)
VALUES
  (2, 2, 'Pro', 79.00, '2025-11-16 00:00:00', 'active', '2025-10-16 00:00:00', '2025-11-16 00:00:00', '2025-10-16 00:00:00'),
  (3, 3, 'Basic', 29.00, '2025-12-05 00:00:00', 'inactive', '2025-11-05 00:00:00', '2025-12-05 00:00:00', '2025-11-05 00:00:00'),
  (4, 5, 'Enterprise', 199.00, '2026-02-12 00:00:00', 'active', '2026-01-13 00:00:00', '2026-02-12 00:00:00', '2026-01-13 00:00:00'),
  (5, 6, 'Pro', 79.00, '2026-04-20 00:00:00', 'active', '2026-03-21 00:00:00', '2026-04-20 00:00:00', '2026-03-21 00:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activity_logs (id, action, entity_type, entity_id, created_at)
VALUES
  (1, 'Approved Company', 'company', 2, '2026-04-01 09:00:00'),
  (2, 'Rejected Company', 'company', 4, '2026-04-01 09:15:00'),
  (3, 'Blocked User', 'user', 4, '2026-04-01 09:30:00'),
  (4, 'Deleted Job', 'job', 6, '2026-04-01 09:45:00')
ON CONFLICT (id) DO NOTHING;

COMMIT;