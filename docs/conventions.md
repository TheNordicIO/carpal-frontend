# Next.js Professional Folder Structure Guide

> **Best practices for team collaboration in Next.js projects using App Router**
> 
> Last Updated: January 2026 | Next.js 14+

## 📋 Table of Contents

- [Architecture Philosophy](#architecture-philosophy)
- [Complete Folder Structure](#complete-folder-structure)
- [Detailed Breakdown](#detailed-breakdown)
- [Naming Conventions](#naming-conventions)
- [Code Organization Patterns](#code-organization-patterns)
- [Configuration Files](#configuration-files)
- [Team Collaboration Guidelines](#team-collaboration-guidelines)
- [Alternative Structures](#alternative-structures)

---

## Architecture Philosophy

### Core Principles

1. **Feature-Based Organization** - groupby business features/domains
2. **Separation of Concerns** - spread UI, business logic, and data layer from each other.
3. **Colocation** - keep related files nearby.
4. **Type Safety** - use TypeScript for all.
5. **Scalability** - future scaleable project.
6. **Testability** - design for eazy to tests.

---

## Complete Folder Structure

```
my-nextjs-app/
├── .github/                          # GitHub Actions & Templates
│   ├── workflows/
│   │   ├── ci.yml
│       └── deploy.yml
│
├── public/                           # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   └── og-image.png
│   ├── fonts/
│   └── icons/
│       └── favicon.ico
│
├── src/
│   ├── app/                          # App Router (Next.js 13+)
│   │   ├── (auth)/                  # Route Group: Authentication
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/             # Route Group: Dashboard
│   │   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   └── security/
│   │   │   └── analytics/
│   │   │
│   │   ├── (marketing)/             # Route Group: Public pages
│   │   │   ├── layout.tsx
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   └── contact/
│   │   │
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   ├── loading.tsx              # Global loading UI
│   │   ├── error.tsx                # Global error UI
│   │   ├── not-found.tsx            # 404 page
│   │   ├── global-error.tsx         # Root error boundary
│   │   └── template.tsx             # Template (optional)
│   │
│   ├── components/                   # Shared Components
│   │   ├── ui/                      # Base/Primitive UI Components
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   ├── input/
│   │   │   ├── card/
│   │   │   ├── modal/
│   │   │   ├── dropdown/
│   │   │   ├── toast/
│   │   │
│   │   ├── forms/                   # Form Components
│   │   │   ├── login-form/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── login-form.schema.ts
│   │   │   │   └── index.ts
│   │   │   ├── register-form/
│   │   │   ├── contact-form/
│   │   │   └── index.ts
│   │   │
│   │   ├── layouts/                 # Layout Components
│   │   │   ├── header/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── header-nav.tsx
│   │   │   │   └── index.ts
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   └── index.ts
│   │   │
│   │   ├── features/                # Feature-specific Components
│   │   │   ├── user-profile/
│   │   │   │   ├── user-avatar.tsx
│   │   │   │   ├── user-stats.tsx
│   │   │   │   └── index.ts
│   │   │   ├── product-card/
│   │   │   ├── analytics-chart/
│   │   │   └── index.ts
│   │   │
│   │   └── providers/               # Context Providers
│   │       ├── theme-provider.tsx
│   │       ├── auth-provider.tsx
│   │       └── index.ts
│   │
│   ├── features/                     # Feature Modules (for complex apps)
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── login.ts
│   │   │   │   └── register.ts
│   │   │   ├── components/
│   │   │   │   ├── auth-form.tsx
│   │   │   │   └── social-login.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   └── use-session.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── validate-token.ts
│   │   │   │   └── hash-password.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── products/
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   │
│   ├── lib/                          # Core Utilities & Configurations
│   │   ├── api/
│   │   │   ├── client.ts            # API client (axios/fetch wrapper)
│   │   │   ├── endpoints.ts         # API endpoints constants
│   │   │   └── interceptors.ts      # Request/response interceptors
│   │   │
│   │   │
│   │   ├── validations/
│   │   │   ├── schemas/
│   │   │   └── rules.ts
│   │   │
│   │   └── utils/
│   │       ├── cn.ts                # Tailwind className utility
│   │       ├── date.ts
│   │       ├── format.ts
│   │       ├── string.ts
│   │       └── index.ts
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── use-auth.ts
│   │   ├── use-toast.ts
│   │   ├── use-media-query.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript Types & Interfaces
│   │   ├── api.ts
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── product.ts
│   │   │   └── index.ts
│   │   ├── global.d.ts
│   │   └── index.ts
│   │
│   ├── styles/                       # Global Styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── config/                       # Application Configuration
│   │   ├── site.ts                  # Site metadata
│   │   ├── navigation.ts            # Navigation structure
│   │   └── constants.ts             # Application constants
│   │
│   │
│   └── middleware.ts                 # Next.js Middleware
│
│
├── scripts/                          # Build & Development Scripts
│   ├── generate-sitemap.ts
│   └── clean.ts
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
│
├── .env.local                        # Local environment variables
├── .env.example                      # Example env file
├── .env.development                  # Development env
├── .env.production                   # Production env
│
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .prettierignore
├── .gitignore
│
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
│
├── package.json
├── pnpm-lock.yaml                    # or yarn.lock / package-lock.json
├── README.md
└── CHANGELOG.md
```

---

## Detailed Breakdown

### 1. `/app` Directory - App Router

Next.js 13+ App Router use file-system based routing

#### Route Groups `(folder)`

```
app/
├── (auth)/          # Route group
│   ├── layout.tsx   # Layout เฉพาะ auth pages
│   ├── login/
│   └── register/
```

**ประโยชน์:**
- spread routes
- use difference layout for each route group
- not conclict URL structure

#### Special Files

```typescript
// layout.tsx - Shared UI for route segments
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// page.tsx - Unique UI for route
export default function Page() {
  return <h1>Home Page</h1>
}

// loading.tsx - Loading UI (Suspense boundary)
export default function Loading() {
  return <div>Loading...</div>
}

// error.tsx - Error UI
'use client'
export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return <div>Error: {error.message}</div>
}

// not-found.tsx - 404 UI
export default function NotFound() {
  return <h2>Not Found</h2>
}
```

### 2. `/components` Directory

#### Organization Strategy

```
components/
├── ui/              # Reusable primitive components (Button, Input, etc.)
├── forms/           # Form-specific components
├── layouts/         # Layout components (Header, Footer, Sidebar)
├── features/        # Business-specific components
└── providers/       # React Context providers
```

#### Component Structure Example

```typescript
// components/ui/button/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

### 3. `/lib` Directory - Core Utilities

```typescript
// lib/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils/format.ts
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
```

### 4. `/types` Directory - Type Definitions

```typescript
// types/models/user.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = Partial<CreateUserInput>

// types/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  status: number
}

// types/global.d.ts
export {}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string
      DATABASE_URL: string
      JWT_SECRET: string
    }
  }
}
```

### 5. `/hooks` Directory - Custom Hooks

```typescript
// hooks/use-auth.ts
import { useContext } from 'react'
import { AuthContext } from '@/components/providers/auth-provider'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}

// hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// hooks/use-media-query.ts
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// hooks/index.ts
export { useAuth } from './use-auth'
export { useDebounce } from './use-debounce'
export { useMediaQuery } from './use-media-query'
export { useLocalStorage } from './use-local-storage'
export { useToast } from './use-toast'
```

---

## Naming Conventions

### 1. Files & Folders

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| Utilities | camelCase | `formatDate.ts`, `apiClient.ts` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useDebounce.ts` |
| Types | PascalCase | `User.ts`, `ApiResponse.ts` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRIES` |
| Folders | kebab-case | `user-profile/`, `api-client/` |
| Route segments | kebab-case | `about-us/`, `contact-us/` |

### 2. Variables & Functions

```typescript
// ❌ Bad
const UserName = 'John'
function GetUserData() {}
const api_endpoint = '/users'

// ✅ Good
const userName = 'John'
function getUserData() {}
const API_ENDPOINT = '/users'

// Constants
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 20

// Booleans - use is/has/should prefix
const isLoading = false
const hasPermission = true
const shouldRender = false

// Functions - use verb prefix
function fetchUsers() {}
function validateEmail() {}
function transformData() {}

// Event handlers - use handle prefix
function handleClick() {}
function handleSubmit() {}
function handleChange() {}

// Async functions - descriptive names
async function fetchUserById(id: string) {}
async function createUser(data: CreateUserInput) {}
```

### 3. Component Patterns

```typescript
// Feature Component Pattern
// components/features/user-profile/user-profile.tsx

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

interface UserProfileProps {
  user: User
  onEdit?: () => void
}

export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <Avatar src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </Card>
  )
}

// With default export for lazy loading
export default UserProfile
```

### 4. Index Files for Clean Imports

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Card } from './card'
export { Modal } from './modal'

// Usage in other files
import { Button, Input, Card } from '@/components/ui'

// Instead of:
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card } from '@/components/ui/card'
```

---

## Code Organization Patterns

### 1. Feature Module Pattern

for features that compliacated we will use modular structure:

```typescript
// features/auth/index.ts
export * from './components'
export * from './hooks'
export * from './types'
export * from './api'

// features/auth/components/index.ts
export { LoginForm } from './login-form'
export { RegisterForm } from './register-form'
export { SocialLogin } from './social-login'

// features/auth/hooks/index.ts
export { useAuth } from './use-auth'
export { useSession } from './use-session'

// features/auth/api/index.ts
export { loginUser, registerUser, logoutUser } from './auth-api'

// Usage:
import { LoginForm, useAuth, loginUser } from '@/features/auth'
```

### 2. Layered Architecture Pattern

```
Server-Side Architecture:

┌─────────────────────────────────────┐
│         Presentation Layer          │
│      (app/*/page.tsx, API routes)   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Server Actions Layer        │
│       (server/actions/*.ts)         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Business Logic Layer         │
│       (server/services/*.ts)        │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Data Access Layer            │
│     (server/repositories/*.ts)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│            Database                 │
│         (Prisma/Drizzle)            │
└─────────────────────────────────────┘
```

**Example:**

```typescript
// 1. Presentation Layer (app/dashboard/users/page.tsx)
import { getUsers } from '@/server/actions/user.actions'

export default async function UsersPage() {
  const users = await getUsers()
  return <UserList users={users} />
}

// 2. Server Actions Layer (server/actions/user.actions.ts) will handle by backend
```

### 3. Compound Component Pattern

```typescript
// components/ui/card/card.tsx
import { createContext, useContext } from 'react'

interface CardContextValue {
  variant: 'default' | 'outlined'
}

const CardContext = createContext<CardContextValue | null>(null)

export function Card({ 
  variant = 'default', 
  children 
}: { 
  variant?: 'default' | 'outlined'
  children: React.ReactNode 
}) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`card card-${variant}`}>
        {children}
      </div>
    </CardContext.Provider>
  )
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card-footer">{children}</div>
}

// Usage:
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'

<Card variant="outlined">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

### 4. Custom Hook Pattern

```typescript
// hooks/use-pagination.ts
import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  )

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  )

  const endIndex = useMemo(
    () => Math.min(startIndex + itemsPerPage, totalItems),
    [startIndex, itemsPerPage, totalItems]
  )

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPreviousPage = () => goToPage(currentPage - 1)

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

// Usage:
function UserList({ users }: { users: User[] }) {
  const pagination = usePagination({
    totalItems: users.length,
    itemsPerPage: 20
  })

  const paginatedUsers = users.slice(
    pagination.startIndex,
    pagination.endIndex
  )

  return (
    <>
      <div>{paginatedUsers.map(user => <UserCard key={user.id} user={user} />)}</div>
      <Pagination {...pagination} />
    </>
  )
}
```

---

## Configuration Files

### 1. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true,
    
    // Path mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/features/*": ["./src/features/*"],
      "@/server/*": ["./src/server/*"],
      "@/config/*": ["./src/config/*"]
    },
    
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // Import
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    
    // General
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 3. Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always",
  "endOfLine": "lf",
  "importOrder": [
    "^react",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@/",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "plugins": ["@trivago/prettier-plugin-sort-imports"]
}
```

### 4. Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  
  // Webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### 5. Environment Variables

```bash
# .env.example
# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Third-party Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
SENDGRID_API_KEY="SG...."

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
```

## Team Collaboration Guidelines

### 1. Git Workflow

```bash
# Feature Branch Workflow

# 1. Create feature branch from dev
git checkout -b feature/user-authentication

# 2. Work on feature with descriptive commits
git add .
git commit -m "feat: add login form validation"

# 3. Push to remote
git push origin feature/user-authentication

# 4. Create Pull Request
# - Add description
# - Link related issues
# - Request reviews

# 5. After approval, squash and merge
```

### 2. Commit Message Convention

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Build process or auxiliary tool changes
perf:     # Performance improvements

# Examples:
feat(auth): add social login with Google
fix(ui): resolve button alignment issue on mobile
docs(readme): update installation instructions
refactor(api): simplify user service logic
test(hooks): add tests for useDebounce hook
chore(deps): upgrade next to 14.1.0
perf(images): optimize image loading with lazy loading
```

### 3. Pull Request Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
<!-- Link to related issues: Closes #123 -->

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Testing Instructions
<!-- Describe how to test your changes -->

1. Step 1
2. Step 2
3. Step 3
```

### 4. Code Review Guidelines

**For Reviewers:**

```markdown
## Review Checklist

### Code Quality
- [ ] Code is readable and maintainable
- [ ] Naming is clear and follows conventions
- [ ] No obvious bugs or security issues
- [ ] Error handling is proper
- [ ] No unnecessary console.logs or comments

### Architecture
- [ ] Changes follow project structure
- [ ] Components are properly organized
- [ ] Logic is in appropriate layers
- [ ] Dependencies are minimal

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper use of React hooks
- [ ] Images are optimized
- [ ] API calls are efficient

### Testing
- [ ] Tests are included for new features
- [ ] Tests cover edge cases
- [ ] All tests pass

### Documentation
- [ ] README is updated if needed
- [ ] Code comments explain complex logic
- [ ] Type definitions are complete
```

### 5. Code Style Guide

```typescript
// ❌ Bad Practices

// 1. Magic numbers
if (user.age > 18) {}

// 2. Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // do something
    }
  }
}

// 3. Long functions
function processUserData() {
  // 100+ lines of code
}

// 4. Unclear names
const d = new Date()
const fn = (x) => x * 2

// ✅ Good Practices

// 1. Named constants
const MINIMUM_AGE = 18
if (user.age > MINIMUM_AGE) {}

// 2. Early returns
if (!user) return
if (!user.isActive) return
if (!user.hasPermission) return
// do something

// 3. Small, focused functions
function validateUser(user: User): boolean {}
function getUserPermissions(user: User): Permissions {}
function processUserData(user: User): ProcessedData {}

// 4. Clear names
const currentDate = new Date()
const doubleValue = (value: number) => value * 2
```

### 6. Documentation Standards

```typescript
/**
 * Authenticates a user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @returns Promise resolving to authenticated user data
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {RateLimitError} If too many attempts
 * 
 * @example
 * ```typescript
 * const user = await authenticateUser('user@example.com', 'password123')
 * console.log(user.name)
 * ```
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticatedUser> {
  // Implementation
}
```

### 7. Testing Strategy
---

## Alternative Structures

### 1. Small Projects (< 10 pages)

```
src/
├── app/
│   ├── page.tsx
│   ├── about/
│   └── contact/
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   └── button.tsx
├── lib/
│   └── utils.ts
└── styles/
    └── globals.css
```

### 2. Monorepo Structure (Turborepo)

```
my-monorepo/
├── apps/
│   ├── web/                    # Main website
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── admin/                  # Admin dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── docs/                   # Documentation site
│       └── ...
│
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                 # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   └── package.json
│   │
│   └── types/                  # Shared types
│       ├── src/
│       └── package.json
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 3. Domain-Driven Design (DDD)

```
src/
├── app/
├── domains/
│   ├── user/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── use-cases/
│   │   └── ui/
│   │
│   ├── product/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── use-cases/
│   │   └── ui/
│   │
│   └── order/
│       └── ...
│
├── shared/
│   ├── ui/
│   ├── utils/
│   └── types/
│
└── infrastructure/
    ├── api/
    ├── database/
    └── cache/
```

### 4. Micro-Frontend Structure

```
src/
├── app/
│   ├── (shell)/              # Shell application
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── @auth/                # Auth micro-frontend
│   │   ├── login/
│   │   └── register/
│   │
│   ├── @dashboard/           # Dashboard micro-frontend
│   │   ├── analytics/
│   │   └── settings/
│   │
│   └── @marketplace/         # Marketplace micro-frontend
│       └── products/
│
├── modules/
│   ├── auth/
│   ├── dashboard/
│   └── marketplace/
│
└── shared/
```

---

## Best Practices Summary

### ✅ DO

1. **Follow conventions consistently** across the entire codebase
2. **Use TypeScript** for type safety
3. **Write tests** for critical functionality
4. **Document complex logic** with comments and JSDoc
5. **Keep components small** and focused (< 200 lines)
6. **Use meaningful names** that describe purpose
7. **Implement error boundaries** for better error handling
8. **Optimize images** and lazy load when possible
9. **Use environment variables** for configuration
10. **Review code** before merging

### ❌ DON'T

1. **Don't mix concerns** - keep UI, logic, and data separate
2. **Don't duplicate code** - create reusable utilities
3. **Don't ignore TypeScript errors** - fix them properly
4. **Don't commit sensitive data** - use .env files
5. **Don't skip testing** - especially for critical paths
6. **Don't use any type** - use proper types instead
7. **Don't over-engineer** - start simple, refactor when needed
8. **Don't ignore performance** - monitor bundle size
9. **Don't forget accessibility** - use semantic HTML and ARIA
10. **Don't work alone** - communicate with your team

---

## Quick Start Checklist

When starting a new Next.js project with this structure:

- [ ] Initialize project with `create-next-app`
- [ ] Set up TypeScript and path aliases in `tsconfig.json`
- [ ] Configure ESLint and Prettier
- [ ] Set up Git hooks with Husky
- [ ] Create folder structure according to this guide
- [ ] Set up environment variables (`.env.example`, `.env.local`)
- [ ] Configure Tailwind CSS (if using)
- [ ] Set up testing framework (Vitest, Jest, or Playwright)
- [ ] Create README with project overview
- [ ] Set up CI/CD pipeline
- [ ] Create PR and commit templates
- [ ] Document coding standards for team
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics (if needed)

---

## Additional Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Community Resources
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

### Tools & Libraries
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components
- [Radix UI](https://www.radix-ui.com) - Unstyled components
- [Zod](https://zod.dev) - Schema validation
- [React Hook Form](https://react-hook-form.com) - Form management
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs) - State management

---

## Conclusion

This folder structure is designed to:
- ✅ Scale with your application
- ✅ Support team collaboration
- ✅ Maintain code quality
- ✅ Follow industry best practices
- ✅ Be adaptable to your specific needs

Remember: **The best structure is one that your team understands and follows consistently.** Adapt this guide to fit your project's specific requirements, but always prioritize clarity, maintainability, and developer experience.

---

**Last Updated:** January 2026  
**Version:** 2.0  
**Maintained by:** OattyDev

For questions or suggestions, please open an issue or submit a PR.