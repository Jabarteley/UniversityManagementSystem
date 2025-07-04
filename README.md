# University Records Management System (URMS)

A comprehensive web-based records management system for universities, focusing on managing personnel and student data, file handling, report generation, and secured network-based access.

## 🎯 Purpose

To design and implement an automated web-based records management system for universities with the following goals:
- Reduce physical/manual paperwork
- Improve record tracking, updating, and report generation
- Support staff and student record operations
- Provide controlled access to academic/administrative modules
- Ensure file storage, retrieval, indexing, and sharing with security and traceability

## 👥 User Roles & Permissions

### 🎓 Student Role
**Permissions:**
- ✅ View & Download personal academic records (transcripts, grades, course registrations)
- ✅ View financial records (tuition fees, scholarships, payment history)
- ✅ Limited Upload Capability (submit required documents with metadata tagging)
- ✅ Search own records only
- ✅ Update personal contact information

**Restrictions:**
- ❌ Cannot modify or delete records
- ❌ No access to staff, financial, or administrative records
- ❌ Cannot generate system-wide reports

### 👨‍🏫 Staff Role
**Sub-Roles:**

#### A. Academic Staff (Faculty/Instructors)
- ✅ Access student grades, attendance, and course materials for their classes
- ✅ Submit final grades and exam results
- ✅ Upload syllabi, lecture notes, and research materials
- ✅ Generate class-specific reports (grade distributions, enrollment stats)

#### B. Administrative Staff (Registry/HR)
- ✅ Manage student admissions, staff payroll, and contracts
- ✅ Edit metadata and archive outdated records
- ✅ Cross-reference records
- ✅ Initiate backups, audit logs, and bulk exports

**Restrictions:**
- ❌ Faculty cannot access financial records (salaries)
- ❌ HR staff cannot modify academic grades

### 👑 Admin Role
- ✅ Complete system management
- ✅ Personnel management (students & staff)
- ✅ User management with role assignment
- ✅ System-wide reports and analytics
- ✅ File and record management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd urms
```

2. **Install dependencies**
```bash
# Install client dependencies
npm install

# Install server dependencies
npm run install:server
```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database for the application
   - Update the connection string in `server/.env`

4. **Configure Environment Variables**
```bash
# Server environment (server/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. **Start the Application**
```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 🏗️ System Architecture

### Frontend (React + TypeScript)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query + Context API
- **Routing:** React Router v6
- **UI Components:** Custom components with Framer Motion animations
- **Icons:** Lucide React

### Backend (Node.js + Express)
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt password hashing
- **File Upload:** Multer middleware
- **Security:** Helmet, CORS, Rate limiting
- **Validation:** Express Validator

### Database Schema
- **Students:** Complete academic and personal records
- **Staff:** Employment information and qualifications
- **Users:** Authentication and role-based permissions
- **Files:** Document management with metadata
- **Reports:** Generated reports and analytics

## 🔧 Key Features

### 📱 Role-Based Dashboards
- **Student Dashboard:** Academic progress, document management, result portal
- **Staff Dashboard:** Class management, grade entry, course materials
- **Admin Dashboard:** System overview, personnel management, analytics

### 📊 Document Management
- **File Upload:** Secure file upload with type validation
- **Metadata Tagging:** Comprehensive file categorization
- **Access Control:** Role-based file access permissions
- **Version Control:** File versioning and history tracking

### 📈 Reporting System
- **Academic Reports:** Student performance analytics
- **Administrative Reports:** Staff and operational reports
- **Custom Reports:** Flexible report generation
- **Export Options:** PDF, Excel, CSV formats

### 🔒 Security Features
- **Authentication:** JWT-based secure authentication
- **Authorization:** Role-based access control (RBAC)
- **Data Validation:** Input sanitization and validation
- **File Security:** Secure file upload and storage
- **Rate Limiting:** API rate limiting for security

## 🎨 UI/UX Features

### 🎭 Design System
- **Modern Design:** Clean, professional interface
- **Responsive Layout:** Mobile-first responsive design
- **Animations:** Smooth Framer Motion animations
- **Color Coding:** Role-based color schemes
- **Accessibility:** WCAG compliant design

### 🚀 Performance
- **Fast Loading:** Optimized bundle sizes
- **Lazy Loading:** Component-based code splitting
- **Caching:** Intelligent data caching with React Query
- **Real-time Updates:** Live data synchronization

## 📁 Project Structure

```
urms/
├── src/                          # Frontend source code
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── api/                     # API client functions
│   ├── contexts/                # React contexts
│   └── hooks/                   # Custom React hooks
├── server/                      # Backend source code
│   ├── src/
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   └── config/             # Configuration files
└── uploads/                     # File upload directory
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students (Admin/Staff)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student (Admin)
- `PUT /api/students/:id` - Update student (Admin)

### Staff
- `GET /api/staff` - Get all staff (Admin)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff (Admin)
- `PUT /api/staff/:id` - Update staff (Admin)

### Files
- `GET /api/files` - Get files (role-based)
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id/download` - Download file

### Reports
- `GET /api/reports` - Get reports (role-based)
- `POST /api/reports/student-academic` - Generate student report
- `POST /api/reports/staff-administrative` - Generate staff report

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server (both frontend and backend)
npm run dev:client   # Start only frontend
npm run dev:server   # Start only backend
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api

# Backend (server/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**University Records Management System (URMS)** - Streamlining academic administration through technology. 🎓"# UniversityManagementSystem" 
