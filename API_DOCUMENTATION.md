# ERP Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
This API uses session-based authentication. After successful login or OAuth, user data is stored in the session.

## Rate Limiting
- **General Routes**: 100 requests per 15 minutes
- **Login Routes**: 5 attempts per 15 minutes  
- **Auth Routes**: 10 attempts per 10 minutes
- **Admin Routes**: 50 operations per 15 minutes

## Response Format
All responses follow this standard format:
```json
{
  "success": true/false,
  "route": "/api/endpoint",
  "message": "Description of result",
  "data": {}, // Response data (when applicable)
  "error": "Error message" // Only when success is false
}
```

---

## 🔓 PUBLIC ROUTES (No Authentication Required)

### 1. User Registration
**POST** `/register`
- **Rate Limit**: Auth Limiter (10 requests per 10 minutes)
- **Description**: Register a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role_id": 4
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/register",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 4
  }
}
```

### 2. User Login
**POST** `/login`
- **Rate Limit**: Login Limiter (5 attempts per 15 minutes)
- **Description**: Authenticate user with email and password
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/login",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": 4
    }
  }
}
```

### 3. Google OAuth Consent
**GET** `/auth/google`
- **Rate Limit**: Auth Limiter (10 requests per 10 minutes)
- **Description**: Get Google OAuth consent URL
- **Request**: No body required
- **Response**:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

### 4. Google OAuth Callback
**GET** `/auth/google/callback?code=AUTH_CODE`
- **Rate Limit**: Auth Limiter (10 requests per 10 minutes)
- **Description**: Handle Google OAuth callback
- **Query Parameters**:
  - `code`: Authorization code from Google
- **Response**: Redirects to `http://localhost:5173/dashboard`

---

## 🔒 AUTHENTICATED ROUTES (Requires Login)

### 5. User Logout
**GET** `/logout`
- **Authentication**: Required
- **Description**: Logout current user and destroy session
- **Request**: No body required
- **Response**: Redirects to home page

### 6. Get Current User Data
**GET** `/userdata`
- **Authentication**: Required
- **Description**: Get current logged-in user's information
- **Request**: No body required
- **Response**:
```json
{
  "status": "success",
  "route": "/userdata",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 4,
    "id": 1
  },
  "error": null
}
```

### 7. Get User by Email
**GET** `/userbyemail`
- **Authentication**: Required
- **Permission**: `user.read`
- **Description**: Get user information by email
- **Query Parameters**:
  - `email`: User's email address
- **Example**: `/userbyemail?email=john@example.com`
- **Response**:
```json
{
  "success": true,
  "route": "/userbyemail",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 4,
    "is_active": true,
    "created_at": "2025-09-06T10:00:00.000Z"
  }
}
```

---

## 👥 USER MANAGEMENT ROUTES

### 8. Get All Users
**GET** `/users`
- **Authentication**: Required
- **Permission**: `user.read`
- **Rate Limit**: Admin Limiter
- **Description**: Get list of all users
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/users",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": 4,
      "is_active": true,
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

---

## 🎭 ROLE MANAGEMENT ROUTES

### 9. Get All Roles
**GET** `/roles`
- **Authentication**: Required
- **Permission**: `role.read`
- **Description**: Get list of all roles
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/roles",
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "description": "Full system access with all permissions",
      "is_active": true,
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

### 10. Get Role by ID
**GET** `/roles/id/:id`
- **Authentication**: Required
- **Permission**: `role.read`
- **Description**: Get specific role by ID
- **URL Parameters**:
  - `id`: Role ID (integer)
- **Example**: `/roles/id/1`
- **Response**:
```json
{
  "success": true,
  "route": "/roles/id/1",
  "data": {
    "id": 1,
    "name": "Super Admin",
    "description": "Full system access with all permissions",
    "is_active": true,
    "created_at": "2025-09-06T10:00:00.000Z"
  }
}
```

### 11. Get Role by Name
**GET** `/roles/name/:name`
- **Authentication**: Required
- **Permission**: `role.read`
- **Description**: Search roles by name (partial match)
- **URL Parameters**:
  - `name`: Role name or partial name
- **Example**: `/roles/name/admin`
- **Response**:
```json
{
  "success": true,
  "route": "/roles/name/admin",
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "description": "Full system access with all permissions",
      "is_active": true
    }
  ]
}
```

### 12. Create New Role
**POST** `/roles`
- **Authentication**: Required
- **Permission**: `role.create`
- **Rate Limit**: Admin Limiter
- **Description**: Create a new role
- **Request Body**:
```json
{
  "name": "Manager",
  "description": "Management level access",
  "is_active": true
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/roles",
  "message": "Role created successfully"
}
```

### 13. Update Role
**PUT** `/roles/:id`
- **Authentication**: Required
- **Permission**: `role.update`
- **Rate Limit**: Admin Limiter
- **Description**: Update existing role
- **URL Parameters**:
  - `id`: Role ID to update
- **Request Body**:
```json
{
  "name": "Senior Manager",
  "description": "Senior management level access",
  "is_active": true
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/roles/1",
  "message": "Role updated successfully"
}
```

### 14. Delete Role
**DELETE** `/roles/:id`
- **Authentication**: Required
- **Permission**: `role.delete`
- **Rate Limit**: Admin Limiter
- **Description**: Delete a role (only if no users are assigned)
- **URL Parameters**:
  - `id`: Role ID to delete
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/roles/1",
  "message": "Role deleted successfully"
}
```
- **Error Response** (if users are assigned):
```json
{
  "success": false,
  "route": "/roles/1",
  "message": "Cannot delete role. 5 users are assigned to this role."
}
```

---

## 🔑 PERMISSION MANAGEMENT ROUTES

### 15. Get All Permissions
**GET** `/permissions`
- **Authentication**: Required
- **Permission**: `permission.read`
- **Description**: Get list of all permissions
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/permissions",
  "data": [
    {
      "id": 1,
      "name": "user.create",
      "description": "Create new users",
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

### 16. Get Permission by ID
**GET** `/permissions/id/:id`
- **Authentication**: Required
- **Permission**: `permission.read`
- **Description**: Get specific permission by ID
- **URL Parameters**:
  - `id`: Permission ID (integer)
- **Example**: `/permissions/id/1`
- **Response**:
```json
{
  "success": true,
  "route": "/permissions/id/1",
  "data": {
    "id": 1,
    "name": "user.create",
    "description": "Create new users",
    "created_at": "2025-09-06T10:00:00.000Z"
  }
}
```

### 17. Create New Permission
**POST** `/permissions`
- **Authentication**: Required
- **Permission**: `permission.create`
- **Rate Limit**: Admin Limiter
- **Description**: Create a new permission
- **Request Body**:
```json
{
  "name": "reports.generate",
  "description": "Generate system reports"
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/permissions",
  "message": "Permission created successfully"
}
```

### 18. Delete Permission
**DELETE** `/permissions/:id`
- **Authentication**: Required
- **Permission**: `permission.delete`
- **Rate Limit**: Admin Limiter
- **Description**: Delete a permission
- **URL Parameters**:
  - `id`: Permission ID to delete
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/permissions/1",
  "message": "Permission deleted successfully"
}
```

---

## 🔗 ROLE-PERMISSION MANAGEMENT ROUTES

### 19. Get All Role-Permission Mappings
**GET** `/rolepermissions`
- **Authentication**: Required
- **Permission**: `permission.read`
- **Description**: Get detailed view of all role-permission assignments
- **Request**: No body required
- **Response**:
```json
{
  "success": true,
  "route": "/rolepermissions",
  "data": [
    {
      "role_id": 1,
      "role_name": "Super Admin",
      "permission_id": 1,
      "permission_name": "user.create",
      "permission_description": "Create new users",
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

### 20. Get Permissions by Role ID
**GET** `/rolepermissions/role/:roleId`
- **Authentication**: Required
- **Permission**: `permission.read`
- **Description**: Get all permissions assigned to a specific role
- **URL Parameters**:
  - `roleId`: Role ID (integer)
- **Example**: `/rolepermissions/role/1`
- **Response**:
```json
{
  "success": true,
  "route": "/rolepermissions/role/1",
  "data": [
    {
      "id": 1,
      "name": "user.create",
      "description": "Create new users",
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

### 21. Get Roles by Permission ID
**GET** `/rolepermissions/permission/:permissionId`
- **Authentication**: Required
- **Permission**: `permission.read`
- **Description**: Get all roles that have a specific permission
- **URL Parameters**:
  - `permissionId`: Permission ID (integer)
- **Example**: `/rolepermissions/permission/1`
- **Response**:
```json
{
  "success": true,
  "route": "/rolepermissions/permission/1",
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "description": "Full system access with all permissions",
      "is_active": true,
      "created_at": "2025-09-06T10:00:00.000Z"
    }
  ]
}
```

### 22. Assign Permission to Role
**POST** `/rolepermissions`
- **Authentication**: Required
- **Permission**: `permission.assign`
- **Rate Limit**: Admin Limiter
- **Description**: Assign a permission to a role
- **Request Body**:
```json
{
  "roleId": 2,
  "permissionId": 5
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/rolepermissions",
  "message": "Permission assigned successfully"
}
```

### 23. Remove Permission from Role
**DELETE** `/rolepermissions`
- **Authentication**: Required
- **Permission**: `permission.assign`
- **Rate Limit**: Admin Limiter
- **Description**: Remove a permission from a role
- **Request Body**:
```json
{
  "roleId": 2,
  "permissionId": 5
}
```
- **Response**:
```json
{
  "success": true,
  "route": "/rolepermissions",
  "message": "Permission removed successfully"
}
```

---

## 📋 DEFAULT ROLES & PERMISSIONS

### Default Roles
1. **Super Admin** (ID: 1) - Full system access with all permissions
2. **Admin** (ID: 2) - Administrative access to most features
3. **Manager** (ID: 3) - Management level access
4. **User** (ID: 4) - Basic user access
5. **Guest** (ID: 5) - Limited read-only access

### Default Permissions
- `user.create` - Create new users
- `user.read` - View user information
- `user.update` - Update user information
- `user.delete` - Delete users
- `role.create` - Create new roles
- `role.read` - View roles
- `role.update` - Update roles
- `role.delete` - Delete roles
- `permission.create` - Create new permissions
- `permission.read` - View permissions
- `permission.update` - Update permissions
- `permission.delete` - Delete permissions
- `role.assign` - Assign roles to users
- `permission.assign` - Assign permissions to roles
- `system.admin` - Full system administration
- `reports.view` - View reports and analytics

---

## ❌ ERROR RESPONSES

### Authentication Errors
```json
{
  "success": false,
  "route": "/protected-endpoint",
  "data": null,
  "error": "Authentication required"
}
```

### Permission Errors
```json
{
  "success": false,
  "route": "/admin-endpoint",
  "data": null,
  "error": "Access denied. Required permission: role.create"
}
```

### Rate Limit Errors
```json
{
  "error": "Too many login attempts, please try again later",
  "retryAfter": 900
}
```

### Validation Errors
```json
{
  "success": false,
  "route": "/register",
  "message": "Validation failed",
  "error": "Email already exists"
}
```

---

## 🔧 Testing with Postman/curl

### Example: Create a Role
```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "name": "Test Role",
    "description": "A test role",
    "is_active": true
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 📝 Notes

1. **Session Management**: After login/OAuth, the session cookie is automatically set. Include this cookie in subsequent requests.

2. **Error Handling**: All routes include comprehensive error handling with descriptive messages.

3. **Data Validation**: Input validation is performed on all endpoints that accept data.

4. **Security**: All routes except public authentication routes require proper authentication and permissions.

5. **Rate Limiting**: Excessive requests will be blocked according to the rate limits specified for each endpoint type.

6. **Database Transactions**: Critical operations use database transactions to ensure data consistency.
