# Point of Sale (POS) System

## Overview
This is a modern Point of Sale (POS) system built for small businesses, featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database integration. The application supports comprehensive product management, transaction processing, user authentication with role-based access control, and business reporting capabilities. It's designed with a mobile-first approach using Tailwind CSS and shadcn/ui components.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state and React Context for authentication
- **Data Storage**: localStorage for offline capabilities and session persistence
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type validation shared between frontend and backend
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and response formatting

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle configured for PostgreSQL dialect with migrations support
- **Local Storage**: Browser localStorage for offline cart persistence and user sessions
- **Schema Management**: Shared TypeScript schemas between client and server using Zod

### Authentication and Authorization
- **Authentication Method**: Username/password-based authentication with role-based access
- **User Roles**: Two-tier system with "admin" and "kasir" (cashier) roles
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Protected Routes**: Frontend route guards using React Context authentication state

### External Dependencies
- **Database Hosting**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Material Icons for consistent iconography
- **Fonts**: Google Fonts (Roboto, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Development**: Replit-specific tooling for development environment integration

### Key Features
- **Product Management**: Full CRUD operations with barcode scanning support, tiered pricing, and inventory tracking
- **Transaction Processing**: Cart management, multiple payment calculation, receipt generation, and transaction holds
- **Reporting**: Daily sales reports with profit tracking and CSV export capabilities
- **Multi-language**: Indonesian language support with date-fns localization
- **Responsive Design**: Mobile-first approach with bottom navigation optimized for tablets and mobile devices