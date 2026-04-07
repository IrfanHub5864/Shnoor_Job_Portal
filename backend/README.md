# Job Portal Backend - Setup Guide

## 📋 Prerequisites

- **Node.js** v14+ installed
- **PostgreSQL** 12+ database server
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

Create a PostgreSQL database using the provided SQL schema:

```bash
# Open your PostgreSQL client and run:
psql -U postgres -f config/database.sql
```

Or use the seed data for testing:

```bash
psql -U postgres -d job_portal -f config/seedData.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_portal
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user (requires token)

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id/approve` - Approve company
- `PUT /api/companies/:id/reject` - Reject company
- `PUT /api/companies/:id/block` - Block company

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/block` - Block user
- `PUT /api/users/:id/unblock` - Unblock user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id/status` - Update job status
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications` - Get all applications
- `PUT /api/applications/:id/status` - Update application status

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `PUT /api/subscriptions/:id/status` - Update subscription status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📧 OTP Verification

When a user logs in:
1. OTP is generated (6-digit code)
2. OTP is printed to server console (in production, use email service)
3. User must enter OTP to complete authentication

## 🗄️ Database Schema

### Tables
- **users** - User accounts and credentials
- **companies** - Company information
- **jobs** - Job postings
- **applications** - Job applications
- **subscriptions** - Company subscriptions
- **otp_verification** - OTP records
- **settings** - Platform settings

## 🛠️ Development Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire in 7 days by default
- OTP expires in 10 minutes
- CORS is enabled for frontend communication
- Error handling middleware catches all errors

## 📝 Example Requests

### Register
```json
POST /api/auth/register
{
  "name": "Company Manager",
  "email": "company.manager@shnoorjobportal.com",
  "password": "secure_password",
  "role": "company_manager"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "superadmin@shnoorjobportal.com",
  "password": "secure_password"
}
```

### Verify OTP
```json
POST /api/auth/verify-otp
{
  "userId": 1,
  "otp": "123456"
}
```

## 🐛 Troubleshooting

- **Database connection error**: Check DB credentials in `.env`
- **Port already in use**: Change PORT in `.env` or kill process using the port
- **OTP not generating**: Check server console for logs
- **CORS errors**: Verify frontend URL in CORS configuration

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
