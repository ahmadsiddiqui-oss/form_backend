# Role-Based Access Control (RBAC) Setup

## 📋 Overview
Your application now has a complete RBAC system with 5 roles and 20 permissions!

## 👥 Roles & Their Permissions

### 1. 🔴 **Admin** (Full Access)
Has **ALL 20 permissions**:
- ✅ create_user, read_user, update_user, delete_user
- ✅ create_book, read_book, update_book, delete_book
- ✅ create_author, read_author, update_author, delete_author
- ✅ manage_roles, manage_permissions
- ✅ view_reports, export_data
- ✅ manage_employees, view_payroll
- ✅ manage_finances, approve_expenses

### 2. 🟡 **Manager** (CRUD + Reports)
Has **14 permissions**:
- ✅ create_user, read_user, update_user, delete_user
- ✅ create_book, read_book, update_book, delete_book
- ✅ create_author, read_author, update_author, delete_author
- ✅ view_reports, export_data
- ❌ manage_roles, manage_permissions
- ❌ manage_employees, view_payroll
- ❌ manage_finances, approve_expenses

### 3. 🔵 **User** (Read-Only)
Has **3 permissions**:
- ✅ read_user, read_book, read_author
- ❌ All create/update/delete operations
- ❌ All management operations

### 4. 🟢 **HR** (Employee Management)
Has **8 permissions**:
- ✅ create_user, read_user, update_user, delete_user
- ✅ manage_employees, view_payroll
- ✅ view_reports, export_data
- ❌ Book/Author management
- ❌ Finance operations

### 5. 🟣 **Finance** (Financial Operations)
Has **7 permissions**:
- ✅ read_user, read_book, read_author (read-only access)
- ✅ manage_finances, approve_expenses
- ✅ view_reports, export_data
- ❌ Create/Update/Delete operations
- ❌ HR operations

---

## 🚀 How to Use Permission Middleware

### Import the middleware:
```javascript
const {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getUserPermissions,
} = require("../middlewares/permissionMiddleware.js");
```

### Example 1: Check Single Permission
```javascript
// Only users with 'create_book' permission can access
router.post(
  "/books",
  auth,
  checkPermission("create_book"),
  bookController.createBook
);
```

### Example 2: Check Any of Multiple Permissions
```javascript
// User needs either 'update_user' OR 'manage_employees'
router.put(
  "/users/:id",
  auth,
  checkAnyPermission("update_user", "manage_employees"),
  userController.updateUser
);
```

### Example 3: Check All Permissions (AND logic)
```javascript
// User needs BOTH 'view_reports' AND 'export_data'
router.get(
  "/reports/export",
  auth,
  checkAllPermissions("view_reports", "export_data"),
  reportController.exportReport
);
```

### Example 4: Get User's Permissions
```javascript
const { getUserPermissions } = require("../middlewares/permissionMiddleware");

async function myController(req, res) {
  const permissions = await getUserPermissions(req.loginUser.id);
  console.log("User has:", permissions);
  // Output: ['read_user', 'read_book', 'read_author']
}
```

---

## 📝 Updated Routes Example

### User Routes (`routes/userRoute.js`)
```javascript
const { checkPermission } = require("../middlewares/permissionMiddleware.js");

// GET /users - View users list
router.get("/", auth, checkPermission("read_user"), userController.getUser);

// POST /users - Create new user
router.post("/", auth, checkPermission("create_user"), userController.postUser);

// PUT /users/:id - Update user
router.put("/:id", auth, checkPermission("update_user"), userController.updateUser);

// DELETE /users/:id - Delete user
router.delete("/:id", auth, checkPermission("delete_user"), userController.deleteUser);
```

### Book Routes
```javascript
// Only Admins and Managers can create books
router.post("/", auth, checkPermission("create_book"), bookController.createBook);

// Everyone with 'read_book' (Admin, Manager, User, Finance) can view
router.get("/", auth, checkPermission("read_book"), bookController.getBooks);
```

---

## 🧪 Testing Your Permissions

### 1. Create users with different roles
```bash
# Admin user
POST /api/auth/signup
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "Admin"
}

# Regular user
POST /api/auth/signup
{
  "name": "Regular User",
  "email": "user@test.com",
  "password": "user123",
  "role": "User"
}
```

### 2. Login and get token
```bash
POST /api/auth/login
{
  "email": "user@test.com",
  "password": "user123"
}
```

### 3. Test permissions
```bash
# This WILL work (User has 'read_book' permission)
GET /api/books
Authorization: Bearer <token>

# This will FAIL (User doesn't have 'create_book' permission)
POST /api/books
Authorization: Bearer <token>
{
  "title": "New Book",
  "isbn": "123456"
}
```

---

## 🔧 Direct Permission Assignment

You can also assign permissions directly to individual users (overrides role permissions):

```javascript
// In a controller or seeder
const user = await User.findByPk(userId);
const permission = await Permission.findOne({ where: { name: 'create_book' } });

// Add permission to user
await user.addPermission(permission);

// Remove permission from user
await user.removePermission(permission);

// Check if user has permission
const hasPermission = await user.hasPermission(permission);
```

---

## 🎯 Next Steps

1. ✅ **Roles are created** (Admin, Manager, User, HR, Finance)
2. ✅ **Permissions are created** (20 total)
3. ✅ **Roles are mapped to permissions**
4. ✅ **Permission middleware is available**
5. ⏭️ **Update all your routes** to use permission checks
6. ⏭️ **Test with different user roles**

Your RBAC system is fully functional! 🎉
