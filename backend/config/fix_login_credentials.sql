-- Repair login credentials for existing databases
-- admin@hirehub.com / admin123
-- manager@hirehub.com / Manager12

UPDATE users
SET password = '$2b$10$Capc9Pa2mw7Ad4CG2qj1hOl2n7KkLKZxCiGypbWeRo/qNF.QFkpJm',
    role = CASE WHEN role IS NULL OR role = '' THEN 'admin' ELSE role END
WHERE email = 'admin@hirehub.com';

INSERT INTO users (name, email, password, role)
VALUES ('Super Admin', 'admin@hirehub.com', '$2b$10$Capc9Pa2mw7Ad4CG2qj1hOl2n7KkLKZxCiGypbWeRo/qNF.QFkpJm', 'admin')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = 'admin';

UPDATE users
SET password = '$2b$10$tjv/DCqxM6Hc4gCxymyOyOyqlYKPyvGVTiy8R/x7o4BvjCd1AMyju',
    role = 'manager'
WHERE email = 'manager@hirehub.com';

INSERT INTO users (name, email, password, role)
VALUES ('Portal Manager', 'manager@hirehub.com', '$2b$10$tjv/DCqxM6Hc4gCxymyOyOyqlYKPyvGVTiy8R/x7o4BvjCd1AMyju', 'manager')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = 'manager';
