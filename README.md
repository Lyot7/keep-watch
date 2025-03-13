# Keep Watch

A personal YouTube video tracking and management application built with Next.js, Prisma, and TypeScript.

## Architecture

The application follows a clean architecture approach with domain-driven design principles:

```
/keep-watch
│── .next/                     # Next.js build output
│── node_modules/              # Dependencies
│── prisma/                    # Prisma ORM (Schema & Migrations)
│   ├── migrations/            # Database migrations
│   ├── schema.prisma          # Prisma schema definition
│── public/                    # Static assets
│── src/                       # Application source code
│   ├── backend/               # Backend (Domain, Application, Infrastructure)
│   │   ├── domain/            # Business logic (Entities & Repositories)
│   │   │   ├── models/        # TypeScript entities
│   │   │   ├── interfaces/    # Interfaces for repositories/services
│   │   ├── application/       # Use-cases & services
│   │   │   ├── services/      # Business logic services
│   │   │   ├── use-cases/     # Specific application logic
│   │   ├── infrastructure/    # External dependencies
│   │   │   ├── database/      # Prisma setup & repository implementations
│   │   │   ├── authentication/# Authentication configuration
│   │   │   ├── api-clients/   # Third-party API integrations
│   │   ├── config/            # Configuration files
│   │   ├── utils/             # Utility functions
│   ├── frontend/              # Frontend (UI Components, Pages, Hooks)
│   │   ├── components/        # Reusable UI components
│   │   ├── layouts/           # Page layouts
│   │   ├── pages/             # Next.js pages (routes)
│   │   │   ├── api/           # API routes
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # Global styles
│   ├── shared/                # Shared utilities, constants, and types
│   │   ├── types/             # TypeScript types & interfaces
│   │   ├── constants/         # App-wide constants
│   │   ├── helpers/           # General helper functions
```

## Features

- Track YouTube videos from your favorite channels
- Organize videos by state (To Watch, Watched, Not Interested, etc.)
- Automatically fetch new videos from channels
- Filter videos by state, channel, and more

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.template` to `.env`
   - Fill in the required values
4. Run database migrations:
   ```
   npx prisma migrate dev
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Technologies

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL
- **API Integration**: YouTube Data API
- **Authentication**: NextAuth.js (planned)

## License

This project is for personal use only.
