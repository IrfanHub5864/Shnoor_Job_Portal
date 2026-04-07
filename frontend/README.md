# Job Portal Frontend - Setup Guide

## 📋 Prerequisites

- **Node.js** v14+ installed
- **npm** or **yarn** package manager
- Backend server running on `http://localhost:5000`

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

The optimized build will be created in the `dist` folder.

## 🌐 Application Pages

### Public Pages
- **`/`** - Opening/Home page with "Get Started", "Login", "Register" buttons
- **`/login`** - Admin login page
- **`/register`** - Admin registration page
- **`/verify-otp`** - OTP verification page after login

### Protected Admin Pages (require authentication)
- **`/admin/dashboard`** - Dashboard with statistics
- **`/admin/companies`** - Company management with approval/rejection
- **`/admin/users`** - User management with block/unblock features
- **`/admin/jobs`** - Job management with delete functionality
- **`/admin/applications`** - Application management with status updates
- **`/admin/subscriptions`** - Subscription viewing
- **`/admin/settings`** - Platform settings and pricing plans

## 🎨 Features

### Opening Page
- Clean, modern UI (non-scrollable)
- "Shnoor Job Portal" branding
- Quick statistics (100+ Companies, 500+ Jobs, 1000+ Users)
- Call-to-action buttons

### Authentication Flow
1. User registers/logs in
2. System generates and displays OTP (console in development)
3. User enters OTP to verify
4. JWT token issued and stored in localStorage
5. User redirected to admin dashboard

### Admin Dashboard
- **Statistics Cards**: Total Companies, Users, Jobs, Applications, Revenue
- **Left Sidebar Navigation**: Menu for all admin sections
- **Responsive Layout**: Works on desktop and mobile

### Company Management
- Table view of all companies
- Status badges (Pending, Approved, Rejected, Blocked)
- Approve/Reject/Block actions

### User Management
- List all users with Block/Unblock functionality
- User status indicators

### Job Management
- View all job postings
- Change status (open/closed)
- Delete jobs

### Application Management
- View all applications
- Change status (Applied, Selected, Rejected)

### Subscription Management
- View company subscriptions
- Display plan name, amount, and dates

### Settings
- Update platform settings
- Display subscription pricing plans

## 🔒 Authentication

- JWT token stored in localStorage
- Token automatically added to all API requests
- Automatic logout if token expires
- Protected routes redirect to home if not authenticated

## 🛠️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Login, Register, OTP pages
│   │   ├── admin/         # Admin layout & dashboard
│   │   ├── pages/         # Opening page
│   │   └── common/        # Reusable components
│   ├── context/           # AuthContext for global state
│   ├── pages/             # Page components
│   ├── api.js             # API service & axios setup
│   ├── index.css          # Global styles
│   ├── App.jsx            # Main app with routing
│   └── index.jsx          # Entry point
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## 🎯 Styling

- **CSS Modules** for component-specific styles
- **Global Styles** in `index.css`
- **CSS Variables** for theming (colors, shadows, etc.)
- **Responsive Design** using CSS Grid/Flexbox

### Color Scheme
- Primary: `#0066cc` (Blue)
- Secondary: `#f0f2f5` (Light Gray)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Warning: `#ffc107` (Yellow)

## 🔌 API Integration

All API calls are handled through `src/api.js`:

- Authentication API
- Company CRUD operations
- User management
- Job management
- Application tracking
- Subscription viewing
- Dashboard statistics

## 📝 Test Credentials

After running seed data in backend:

```
Email: superadmin@shnoorjobportal.com
Password: admin123
```

Login will generate a 6-digit OTP (check server console).

## 🚀 Performance Features

- Code splitting with React Router
- Lazy loading of admin pages
- Loading states and spinners
- Error handling with user feedback
- Responsive tables with overflow handling

## 🐛 Troubleshooting

**Q: Getting 404 errors for API calls**
- A: Ensure backend is running on `http://localhost:5000`

**Q: Localhost:3000 not accessible**
- A: Check if port 3000 is free, or change in vite.config.js

**Q: OTP not displaying**
- A: Check browser console and server logs

**Q: Styles not loading**
- A: Clear browser cache and restart dev server

**Q: Protected routes redirecting to home**
- A: Check if token exists in localStorage and is valid

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [React Router Guide](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Axios Documentation](https://axios-http.com/)

## 🔄 Development Workflow

1. Start backend: `npm run dev` (from backend folder)
2. Start frontend: `npm run dev` (from frontend folder)
3. Open browser: `http://localhost:3000`
4. Make changes and see hot reload
5. Build for production: `npm run build`

## 📦 Deployment

For production deployment:

1. Build frontend: `npm run build`
2. Deploy the `dist` folder to your hosting
3. Configure backend API URL in `src/api.js`
4. Ensure CORS is properly configured on backend
