# Authentication Quick Reference Guide

## 🚀 Quick Start

### Protect a New Route
Add the route to the `protectedRoutes` array in `middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

### Add a New Auth Route
Add the route to the `authRoutes` array in `middleware.ts`:

```typescript
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
```

## 📦 Common Code Snippets

### Get Current User (Server Component)

```typescript
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Get Current User (Client Component)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Logout Button

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = () => {
    router.push('/api/auth/logout');
  };
  
  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
}
```

### Protected API Route

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Your protected logic here
  return NextResponse.json({ data: 'Protected data' });
}
```

### Custom Hook for Auth

Create `hooks/useAuth.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
}

export function useAuth(redirectTo?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user && redirectTo) {
          router.push(redirectTo);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (redirectTo) {
          router.push(redirectTo);
        }
      })
      .finally(() => setLoading(false));
  }, [router, redirectTo]);
  
  return { user, loading };
}

// Usage:
// const { user, loading } = useAuth('/login');
```

## 🔐 Token Management

### Get Token (Server-Side)

```typescript
import { cookies } from 'next/headers';

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}
```

### Verify Token

```typescript
import { verifyToken } from '@/lib/auth';

const token = 'your-jwt-token';
const payload = await verifyToken(token);

if (payload) {
  console.log('Valid token:', payload);
} else {
  console.log('Invalid token');
}
```

### Create Token

```typescript
import { signToken } from '@/lib/auth';

const payload = {
  userId: '123',
  email: 'user@example.com',
};

const token = await signToken(payload);
```

## 🧪 Testing Helpers

### Mock Authenticated User (for testing)

```typescript
// In your test file
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';

async function mockAuthUser(user: any) {
  const token = await signToken(user);
  const cookieStore = await cookies();
  cookieStore.set('token', token);
}
```

## 🎯 Common Patterns

### Conditional Rendering Based on Auth

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <header>
      {user ? (
        <div>
          <span>Welcome, {user.fullName}</span>
          <LogoutButton />
        </div>
      ) : (
        <div>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      )}
    </header>
  );
}
```

### Protected Form Submission

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ProtectedForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/protected-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* your data */ }),
      });
      
      if (res.status === 401) {
        // Token expired or invalid
        router.push('/login');
        return;
      }
      
      const data = await res.json();
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 📋 Checklist for New Features

When adding a new feature that requires authentication:

- [ ] Is this a protected route? Add to `protectedRoutes` in middleware
- [ ] Does this need user data? Use `getCurrentUser()` or `/api/auth/me`
- [ ] Is this an API endpoint? Add auth check at the start
- [ ] Does the UI change based on auth? Use `useAuth()` hook
- [ ] Are there any redirects? Consider the redirect parameter
- [ ] Is error handling in place for 401 responses?
- [ ] Are loading states handled properly?

## 🐛 Troubleshooting

### User not redirected after login
- Check if redirect parameter is being passed correctly
- Verify `searchParams.get('redirect')` in login page

### Infinite redirect loop
- Check if protected route is also in auth routes
- Verify middleware matcher config

### Token not persisting
- Check cookie settings (httpOnly, secure, path)
- Verify token expiration time
- Check if logout is being called unexpectedly

### 401 errors on protected routes
- Verify token is being sent in cookies
- Check token expiration
- Verify `getCurrentUser()` is working correctly

## 📚 Related Files

- `middleware.ts` - Route protection
- `lib/auth.ts` - Auth helper functions
- `app/(auth)/layout.tsx` - Auth layout wrapper
- `app/api/auth/*` - Auth API endpoints
- `docs/AUTHENTICATION.md` - Full documentation
- `docs/AUTH_FLOW_DIAGRAMS.md` - Visual flow diagrams
