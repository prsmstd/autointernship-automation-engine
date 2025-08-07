# Project Structure & Architecture

## Directory Organization

### `/app` - Next.js App Router
- **File-based routing** with nested layouts
- **Route groups** for logical organization (auth, admin)
- **API routes** in `/app/api` following RESTful conventions
- **Page components** as default exports with metadata
- **Layout components** for shared UI structure

### `/components` - Reusable UI Components
- **Domain-specific folders**: `/admin`, `/auth`, `/dashboard`
- **UI primitives**: `/ui` for base components (Button, Card, Input)
- **Compound components**: Complex components built from primitives
- **TypeScript interfaces** for all component props

### `/lib` - Utility Libraries & Services
- **Database clients**: Supabase configuration and type definitions
- **External integrations**: AI evaluator, payment processing, certificate generation
- **Utility functions**: Common helpers and type utilities
- **Configuration files**: Auth, security, and service configurations

### `/database` - Database Schema
- **SQL schema files** for Supabase setup
- **Migration scripts** and seed data
- **Type definitions** generated from schema

## Architectural Patterns

### Component Architecture
- **Functional components** with React hooks
- **Compound component pattern** for complex UI elements
- **Render props** and **children as functions** where appropriate
- **Controlled components** for form inputs

### Data Flow
- **Server-side data fetching** in page components
- **Client-side state management** with React Context
- **Optimistic updates** for better UX
- **Error boundaries** for graceful error handling

### Authentication & Authorization
- **Supabase Auth** for user management
- **Row Level Security** for database access control
- **Role-based access** (student, admin)
- **Protected routes** with middleware

### API Design
- **RESTful endpoints** in `/app/api`
- **Consistent error handling** with proper HTTP status codes
- **Request validation** and sanitization
- **Mock implementations** for development

## File Naming Conventions

### Components
- **PascalCase** for component files: `StudentDashboard.tsx`
- **camelCase** for utility functions: `createSupabaseClient`
- **kebab-case** for API routes: `/api/verify-certificate`

### Database
- **snake_case** for table and column names
- **Descriptive names** for foreign keys: `user_id`, `task_id`
- **Consistent prefixes** for related tables

## Code Organization Principles

### Separation of Concerns
- **UI components** focus only on presentation
- **Business logic** isolated in service layers
- **Database operations** abstracted through client libraries
- **External API calls** wrapped in service functions

### Error Handling
- **Graceful degradation** when external services fail
- **Mock implementations** for development
- **Consistent error responses** across API endpoints
- **User-friendly error messages** in UI

### Type Safety
- **Strict TypeScript** configuration
- **Database types** generated from schema
- **Component prop interfaces** for all components
- **API response types** for external services

## Import Conventions
- **Absolute imports** using `@/` path mapping
- **Grouped imports**: React, external libraries, internal modules
- **Named exports** preferred over default exports for utilities
- **Consistent import order** throughout codebase