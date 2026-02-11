# Authentication System Documentation

## Overview

This application implements a comprehensive authentication system with route protection for both authenticated and unauthenticated users.

## Features

### 1. **Route Protection**
- **Protected Routes**: Dashboard routes (`/dashboard/*`) require authentication
- **Auth Routes**: Login, register, forgot-password, and reset-password routes redirect authenticated users to dashboard
- **Middleware-based**: Uses Next.js middleware for server-side route protection

### 2. **Token-based Authentication**
- JWT tokens stored in HTTP-only cookies
- Tokens expire after 24 hours
- Automatic token verification on protected routes

### 3. **Redirect Functionality**
- Unauthenticated users trying to access protected routes are redirected to login with a `redirect` query parameter
- After successful login, users are redirected to their originally requested page

## File Structure

```
frontend/
├── middleware.ts                      # Route protection middleware
├── lib/
│   └── auth.ts                       # Auth helper functions
├── app/
│   ├── (auth)/                       # Auth layout group
│   │   ├── layout.tsx               # Auth layout wrapper
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   ├── register/
│   │   │   └── page.tsx             # Register page
│   │   └── forgot-password/
│   │       └── page.tsx             # Forgot password page
│   ├── (dashboard)/                  # Dashboard layout group
│   │   ├── layout.tsx               # Dashboard layout
│   │   └── dashboard/
│   │       └── ...                  # Dashboard pages
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts         # Login API endpoint
│           ├── register/
│           │   └── route.ts         # Register API endpoint
│           ├── logout/
│           │   └── route.ts         # Logout API endpoint
│           └── me/
│               └── route.ts         # Get current user endpoint
```

## How It Works

### Middleware (`middleware.ts`)

The middleware runs on every request and:
1. Checks if the route is protected or an auth route
2. Verifies the JWT token from cookies
3. Redirects unauthenticated users from protected routes to `/login?redirect={originalPath}`
4. Redirects authenticated users from auth routes to `/dashboard`

### Auth Helper Functions (`lib/auth.ts`)

- `hashPassword(password)`: Hash passwords using bcrypt
- `comparePassword(password, hash)`: Compare password with hash
- `signToken(payload)`: Create JWT token
- `verifyToken(token)`: Verify and decode JWT token
- `getCurrentUser()`: Get current user from cookie token

### Auth Layout (`app/(auth)/layout.tsx`)

Client-side layout that:
- Checks authentication status on mount
- Redirects authenticated users to dashboard
- Prevents flash of auth pages for authenticated users

### Login Flow

1. User visits `/dashboard` without being authenticated
2. Middleware redirects to `/login?redirect=/dashboard`
3. User enters credentials and submits form
4. Frontend calls `/api/auth/login`
5. Backend validates credentials and returns token
6. Token is stored in HTTP-only cookie
7. User is redirected to `/dashboard` (from redirect param)

### Logout Flow

1. User clicks logout button
2. Frontend navigates to `/api/auth/logout`
3. Backend deletes the token cookie
4. User is redirected to `/login`

## API Endpoints

### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "device": {
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### GET `/api/auth/me`
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### GET `/api/auth/logout`
Logout current user (deletes token cookie and redirects to login).

## Usage Examples

### Protecting a New Route

To protect a new route, simply add it to the `protectedRoutes` array in `middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

### Adding a New Auth Route

To add a new auth route (that should redirect authenticated users), add it to the `authRoutes` array in `middleware.ts`:

```typescript
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
```

### Getting Current User in a Server Component

```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Welcome, {user.fullName}!</div>;
}
```

### Getting Current User in a Client Component

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return <div>Welcome, {user.fullName}!</div>;
}
```

## Security Considerations

1. **HTTP-only Cookies**: Tokens are stored in HTTP-only cookies to prevent XSS attacks
2. **Secure Flag**: In production, cookies use the `secure` flag (HTTPS only)
3. **Token Expiration**: Tokens expire after 24 hours
4. **Server-side Validation**: All protected routes validate tokens server-side via middleware
5. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 10

## Testing

### Test Protected Route Access
1. Visit `/dashboard` without being logged in
2. You should be redirected to `/login?redirect=/dashboard`

### Test Auth Route Access
1. Log in to the application
2. Try to visit `/login` or `/register`
3. You should be redirected to `/dashboard`

### Test Redirect After Login
1. Visit `/dashboard` without being logged in
2. You'll be redirected to `/login?redirect=/dashboard`
3. Log in successfully
4. You should be redirected back to `/dashboard`

### Test Logout
1. Log in to the application
2. Navigate to `/api/auth/logout`
3. You should be logged out and redirected to `/login`
