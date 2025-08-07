# Technology Stack

## Framework & Runtime
- **Next.js 14** with App Router - React framework for full-stack development
- **TypeScript** - Strict typing throughout the codebase
- **Node.js** - Server-side runtime

## Frontend
- **React 18** - UI library with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Icon library
- **Font Awesome** - Additional icons via CDN
- **class-variance-authority (CVA)** - Component variant management

## Backend & Database
- **Supabase** - PostgreSQL database with real-time features and authentication
- **Row Level Security (RLS)** - Database-level access control
- **Supabase Auth** - User authentication and session management

## AI & External Services
- **Google Gemini AI** - Repository evaluation and feedback generation
- **GitHub API** - Repository content extraction
- **Razorpay** - Payment processing (with mock fallback)
- **Resend** - Email notifications
- **PDF-lib** - Certificate PDF generation

## Development Tools
- **ESLint** - Code linting with Next.js configuration
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## Common Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Database
```bash
npm run db:generate  # Generate TypeScript types from Supabase schema
```

### Setup
```bash
npm install          # Install dependencies
cp .env.example .env.local  # Setup environment variables
```

## Environment Configuration
- All environment variables should be defined in `.env.local`
- Use `.env.example` as template
- Mock mode automatically enabled when external services are not configured
- Supabase configuration required for database operations
- External API keys optional (fallback to mock implementations)