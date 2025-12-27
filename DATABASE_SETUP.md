# Database Setup Summary

## ✅ Completed Tasks

### 1. Migrations Run
All 7 migration files have been successfully executed:
- Authors table
- Books table
- Users table
- Roles table
- Permissions table
- RolePermissions junction table
- UserPermissions junction table

### 2. Seeders Run
Two seeders have been executed to populate initial data:

#### Roles Seeder
Created 5 default roles:
1. **Admin** - Full system access
2. **Manager** - Management level access
3. **User** - Basic user access (default)
4. **HR** - Human Resources department
5. **Finance** - Finance department

#### Permissions Seeder
Created 20 permissions:

**User Management:**
- create_user
- read_user
- update_user
- delete_user

**Book Management:**
- create_book
- read_book
- update_book
- delete_book

**Author Management:**
- create_author
- read_author
- update_author
- delete_author

**Role & Permission Management:**
- manage_roles
- manage_permissions

**Reports & Analytics:**
- view_reports
- export_data

**HR Specific:**
- manage_employees
- view_payroll

**Finance Specific:**
- manage_finances
- approve_expenses

## 📝 User Signup

### Endpoint: POST /api/users/signup

### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "Manager"  // Options: Admin, Manager, User, HR, Finance
}
```

### Response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Manager",
    "roleId": 2
  }
}
```

## 🔧 Next Steps

### Option 1: Assign Permissions to Roles
You can now create seeders or API endpoints to assign permissions to roles via the RolePermissions table.

Example role-permission mappings:
- **Admin**: All permissions
- **Manager**: All CRUD + view_reports + export_data
- **User**: Read permissions only
- **HR**: User management + manage_employees + view_payroll
- **Finance**: manage_finances + approve_expenses + view_reports

### Option 2: Assign Direct Permissions to Users
You can assign specific permissions to individual users via the UserPermissions table.

## 📚 Database Schema

```
Users
├── id (PK)
├── name
├── email
├── hashPassword
├── roleId (FK -> Roles)
├── profileImage
├── authToken
├── resetToken
└── resetTokenExpiry

Roles
├── id (PK)
└── name

Permissions
├── id (PK)
└── name

RolePermissions (Many-to-Many)
├── roleId (FK -> Roles)
└── permissionId (FK -> Permissions)

UserPermissions (Many-to-Many)
├── userId (FK -> Users)
└── permissionId (FK -> Permissions)
```

## 🎯 Testing Signup

Try creating users with different roles:

```bash
# Admin User
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "Admin"
  }'

# HR User
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR Manager",
    "email": "hr@test.com",
    "password": "hr123",
    "role": "HR"
  }'

# Finance User
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Finance Officer",
    "email": "finance@test.com",
    "password": "finance123",
    "role": "Finance"
  }'
```

All seeders and migrations are ready! Your RBAC system is now fully set up! 🎉
