# ERP Complete Backend

A comprehensive Role-Based Access Control (RBAC) ERP backend system built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Management**: Complete user registration, authentication, and management
- **Role-Based Access Control (RBAC)**: Granular permission system with role hierarchies
- **OAuth Integration**: Google OAuth 2.0 for social login
- **Session Management**: Secure session-based authentication
- **Rate Limiting**: Protection against abuse with configurable limits
- **Database Integration**: PostgreSQL with connection pooling
- **RESTful API**: Well-structured API endpoints with comprehensive documentation

## 🏗️ Architecture

### Core Components
- **Authentication & Authorization**: Session-based auth with OAuth support
- **User Management**: User registration, login, profile management
- **Role Management**: Create, update, delete roles with descriptions
- **Permission System**: Granular permissions (user.*, role.*, permission.*, etc.)
- **Role-Permission Mapping**: Many-to-many relationship management

### Default Roles
1. **Super Admin** (ID: 1) - Full system access
2. **Admin** (ID: 2) - Administrative access
3. **Manager** (ID: 3) - Management level access
4. **User** (ID: 4) - Basic user access
5. **Guest** (ID: 5) - Limited read-only access

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erpcompletebackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   PORT=3000
   ```

4. **Database Setup**
   Ensure your PostgreSQL database is running and accessible.

## 🚀 Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Create Superuser
```bash
npm run create-superuser
```

### Verify Superuser
```bash
npm run verify-superuser
```

## 📚 API Documentation

The API documentation is available in `API_DOCUMENTATION.md` which includes:

- Complete endpoint reference
- Request/response formats
- Authentication requirements
- Permission levels
- Rate limiting information
- Error handling

### Base URL
```
http://localhost:3000
```

### Key Endpoints

#### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `GET /auth/google` - Google OAuth
- `GET /logout` - User logout

#### User Management
- `GET /users` - List all users
- `GET /userdata` - Current user data
- `GET /userbyemail` - Get user by email

#### Role Management
- `GET /roles` - List all roles
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

#### Permission Management
- `GET /permissions` - List all permissions
- `POST /permissions` - Create permission
- `DELETE /permissions/:id` - Delete permission

#### Role-Permission Mapping
- `GET /rolepermissions` - List all mappings
- `POST /rolepermissions` - Assign permission to role
- `DELETE /rolepermissions` - Remove permission from role

## 🔐 Security Features

- **Rate Limiting**: Different limits for different endpoint types
- **Session Security**: Secure session configuration
- **Password Hashing**: bcrypt for password security
- **Permission Checking**: Middleware-based access control
- **OAuth Security**: Google OAuth 2.0 implementation
- **Input Validation**: Comprehensive request validation

## 🗂️ Project Structure

```
erpcompletebackend/
├── controller/          # Request handlers
│   ├── user.controller.js
│   ├── role.controller.js
│   ├── permission.controller.js
│   ├── rolepermission.controller.js
│   └── oauth.js
├── db/                  # Database layer
│   ├── setup.db.js
│   ├── user.db.js
│   ├── role.db.js
│   ├── permission.db.js
│   └── haspermission.js
├── middleware/          # Custom middleware
│   ├── routeaccess.miidle.js
│   └── googletoktn.middleware.js
├── routes/              # Route definitions
│   └── admin.routes.js
├── scripts/             # Utility scripts
│   ├── create-superuser.js
│   └── verify-superuser.js
├── utils/               # Utility functions
│   ├── AsyncHandler.js
│   ├── hash.js
│   └── limiter.js
├── app.js              # Express app configuration
├── index.js            # Application entry point
└── package.json        # Dependencies and scripts
```

## 🧪 Testing

To test the API endpoints, you can use:
- **Postman**: Import the API endpoints
- **curl**: Command line testing
- **Your frontend application**: Direct integration

### Example Login Test
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sumanth@superadmin.com",
    "password": "Mythri@14"
  }'
```

## 🔧 Configuration

### Rate Limits
- **Login**: 5 attempts per 15 minutes
- **Auth**: 10 requests per 10 minutes
- **Admin**: 50 operations per 15 minutes
- **General**: 100 requests per 15 minutes

### Session Configuration
- Session-based authentication
- Secure cookie settings
- Configurable session timeout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Issues

If you encounter any issues, please create an issue in the repository with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment information

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Created by**: Development Team  
**Last Updated**: September 6, 2025  
**Version**: 1.0.0
