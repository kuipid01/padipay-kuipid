# Authentication Flow Diagrams

## 1. Unauthenticated User Accessing Protected Route

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Flow (Not Logged In)                    │
└─────────────────────────────────────────────────────────────────┘

    User
     │
     │ 1. Navigate to /dashboard
     ▼
┌─────────────────┐
│   Middleware    │
│  (middleware.ts)│
└────────┬────────┘
         │
         │ 2. Check token in cookies
         │    → No token found
         │
         │ 3. Check if route is protected
         │    → /dashboard is protected
         │
         │ 4. Redirect to /login?redirect=/dashboard
         ▼
┌─────────────────┐
│  Login Page     │
│  /login         │
└────────┬────────┘
         │
         │ 5. User enters credentials
         │
         │ 6. POST /api/auth/login
         ▼
┌─────────────────┐
│  Login API      │
│  /api/auth/login│
└────────┬────────┘
         │
         │ 7. Validate credentials
         │ 8. Create JWT token
         │ 9. Set HTTP-only cookie
         │ 10. Return user data
         ▼
┌─────────────────┐
│  Login Page     │
│  (Success)      │
└────────┬────────┘
         │
         │ 11. Read redirect param (/dashboard)
         │ 12. Navigate to /dashboard
         ▼
┌─────────────────┐
│   Middleware    │
└────────┬────────┘
         │
         │ 13. Check token in cookies
         │     → Token found and valid
         │
         │ 14. Allow access
         ▼
┌─────────────────┐
│  Dashboard      │
│  /dashboard     │
└─────────────────┘
```

## 2. Authenticated User Accessing Auth Route

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Flow (Logged In)                        │
└─────────────────────────────────────────────────────────────────┘

    User (Logged In)
     │
     │ 1. Navigate to /login
     ▼
┌─────────────────┐
│   Middleware    │
│  (middleware.ts)│
└────────┬────────┘
         │
         │ 2. Check token in cookies
         │    → Token found and valid
         │
         │ 3. Check if route is auth route
         │    → /login is auth route
         │
         │ 4. Redirect to /dashboard
         ▼
┌─────────────────┐
│  Dashboard      │
│  /dashboard     │
└─────────────────┘
```

## 3. Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Logout Flow                             │
└─────────────────────────────────────────────────────────────────┘

    User (Logged In)
     │
     │ 1. Click logout button
     │
     │ 2. Navigate to /api/auth/logout
     ▼
┌─────────────────┐
│  Logout API     │
│ /api/auth/logout│
└────────┬────────┘
         │
         │ 3. Delete token cookie
         │ 4. Redirect to /login
         ▼
┌─────────────────┐
│  Login Page     │
│  /login         │
└─────────────────┘
```

## 4. Component-Level Authentication Check

```
┌─────────────────────────────────────────────────────────────────┐
│              Auth Layout (Client-Side Check)                    │
└─────────────────────────────────────────────────────────────────┘

    User navigates to /login
     │
     ▼
┌─────────────────┐
│  Auth Layout    │
│ (auth)/layout.tsx│
└────────┬────────┘
         │
         │ 1. useEffect on mount
         │
         │ 2. Fetch /api/auth/me
         ▼
┌─────────────────┐
│   Auth API      │
│  /api/auth/me   │
└────────┬────────┘
         │
         ├─── Token valid ────┐
         │                    │
         │                    ▼
         │              ┌─────────────────┐
         │              │  Redirect to    │
         │              │  /dashboard     │
         │              └─────────────────┘
         │
         └─── No token or invalid ────┐
                                      │
                                      ▼
                                ┌─────────────────┐
                                │  Show Login     │
                                │  Page           │
                                └─────────────────┘
```

## 5. Route Protection Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                    Route Protection Matrix                       │
└──────────────────────────────────────────────────────────────────┘

Route                  │ Authenticated │ Unauthenticated
─────────────────────────────────────────────────────────────────
/                      │ ✓ Allow       │ ✓ Allow
/dashboard             │ ✓ Allow       │ ✗ Redirect to /login
/dashboard/*           │ ✓ Allow       │ ✗ Redirect to /login
/login                 │ ✗ Redirect    │ ✓ Allow
/register              │ ✗ Redirect    │ ✓ Allow
/forgot-password       │ ✗ Redirect    │ ✓ Allow
/reset-password        │ ✗ Redirect    │ ✓ Allow
/api/auth/login        │ ✓ Allow       │ ✓ Allow
/api/auth/register     │ ✓ Allow       │ ✓ Allow
/api/auth/logout       │ ✓ Allow       │ ✓ Allow
/api/auth/me           │ ✓ Return user │ ✗ Return 401
```

## 6. Token Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                             │
└──────────────────────────────────────────────────────────────────┘

    Login
     │
     │ 1. User submits credentials
     ▼
┌─────────────────┐
│  Create Token   │
│  (JWT)          │
│  - Payload: user│
│  - Expires: 24h │
└────────┬────────┘
         │
         │ 2. Store in HTTP-only cookie
         │    - httpOnly: true
         │    - secure: true (prod)
         │    - maxAge: 86400 (24h)
         │    - path: /
         ▼
┌─────────────────┐
│  Token Active   │
│  (24 hours)     │
└────────┬────────┘
         │
         ├─── User Activity ────┐
         │                      │
         │                      ▼
         │                ┌─────────────────┐
         │                │  Middleware     │
         │                │  Validates      │
         │                │  Token          │
         │                └────────┬────────┘
         │                         │
         │                         ├─ Valid ──► Allow Access
         │                         │
         │                         └─ Invalid ─► Redirect to Login
         │
         ├─── 24 Hours Pass ────┐
         │                      │
         │                      ▼
         │                ┌─────────────────┐
         │                │  Token Expires  │
         │                │  Auto Logout    │
         │                └─────────────────┘
         │
         └─── Manual Logout ────┐
                                │
                                ▼
                          ┌─────────────────┐
                          │  Delete Cookie  │
                          │  Redirect Login │
                          └─────────────────┘
```
