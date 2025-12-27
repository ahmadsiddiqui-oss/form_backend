# Frontend RBAC Implementation Guide

This guide explains how to implement Role & Permission-based access control in your frontend (React/Next.js/Vue) using the data provided by the backend.

## 1. Backend API Update (Already Done ✅)

The `/api/auth/login` endpoint now returns a `permissions` array in the response:

```json
{
  "message": "Login successful",
  "token": "eyJhb...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "role": "Manager",
    "roleId": 2,
    "permissions": ["create_user", "read_book", "view_reports"] 
  }
}
```

---

## 2. Global State Management

You need to store these permissions when the user logs in.

### Using Context API (Example)

```javascript
// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // User object will look like: { name: '...', role: '...', permissions: ['...'] }

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check valid permission
  const checkPermission = (requiredPermission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
  };
  
  // Check valid role
  const checkRole = (requiredRole) => {
    if (!user || !user.role) return false;
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkPermission, checkRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 3. Creating Helper Components

### A. `<Can>` Component (For UI Elements)

Use this to conditionally render buttons/links based on permissions.

```javascript
// components/Can.js
import { useAuth } from '../context/AuthContext';

const Can = ({ perform, children }) => {
  const { checkPermission } = useAuth();

  if (checkPermission(perform)) {
    return <>{children}</>;
  }
  
  return null; // Don't render if no permission
};

export default Can;
```

#### Usage:
```javascript
// In your UserList component
import Can from './components/Can';

return (
  <div>
    <h1>User List</h1>
    
    {/* Only show "Add User" button if user has 'create_user' permission */}
    <Can perform="create_user">
      <button onClick={handleAddUser}>Add New User</button>
    </Can>

    {users.map(user => (
      <div key={user.id}>
        {user.name}
        
        {/* Only show Delete button if user has 'delete_user' permission */}
        <Can perform="delete_user">
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </Can>
      </div>
    ))}
  </div>
);
```

---

### B. `<ProtectedRoute>` (For Routing)

Use this to prevent access to entire pages.

```javascript
// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, checkPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !checkPermission(requiredPermission)) {
    // User is logged in but doesn't have the specific permission
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

#### Usage in App.js:
```javascript
<Routes>
  {/* Public Route */}
  <Route path="/login" element={<LoginPage />} />

  {/* Protected Routes */}
  <Route 
    path="/admin/users" 
    element={
      <ProtectedRoute requiredPermission="read_user">
        <UsersPage />
      </ProtectedRoute>
    } 
  />
  
  <Route 
    path="/admin/finance" 
    element={
      <ProtectedRoute requiredPermission="manage_finances">
        <FinanceDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## 4. Summary of Logic Flow

1.  **User Login**:
    *   Backend verifies credentials.
    *   Backend fetches Role (e.g., "Manager") -> Queries `RolePermissions` -> Returns list of permissions strings.
    *   Frontend receives JSON with `token` and `user.permissions`.
2.  **Store Data**:
    *   Frontend saves this data to `AuthContext` / `Redux Store`.
3.  **UI Rendering**:
    *   **Sidebar/Navigation**: Hide tabs using `checkPermission()`. e.g., don't show "Finance" tab if user lacks `manage_finances`.
    *   **Buttons**: Wrap sensitive buttons in `<Can perform="...">`.
4.  **Route Protection**:
    *   Wrap backend API calls in frontend services. If backend returns `403 Forbidden`, show a toast notification "Access Denied".

## 5. Security Note

**Always Remember**: Frontend security is just "visual". Always protect your Backend API endpoints using the `checkPermission` middleware I set up earlier (`routes/userRoute.js`). 

Frontend hiding prevents clicking; Backend protection prevents hacking.
