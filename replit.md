# FreedomShare - Anonymous Social Media Platform

## Overview

FreedomShare is a full-stack anonymous social media platform built with modern web technologies. It enables users to share thoughts and opinions without creating accounts, emphasizing free expression and community-driven content moderation through voting and reporting systems.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn/UI components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Deployment Strategy
- **Platform**: Replit with autoscale deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Production**: Serves static files from Express server
- **Development**: Vite dev server with HMR support

## Key Components

### Database Schema
- **Posts Table**: Stores post content with anonymous IDs, scores, and timestamps
- **Votes Table**: Tracks upvotes/downvotes with IP-based deduplication
- **Reports Table**: Handles content moderation reports
- **IP Hashing**: Uses SHA-256 to prevent duplicate votes while maintaining anonymity

### Authentication & Privacy
- **No User Accounts**: Completely anonymous posting system
- **IP-Based Deduplication**: Prevents spam while maintaining privacy through hashing
- **Anonymous Post IDs**: Generated unique identifiers like #A7B9C2 for each post

### API Structure
- `GET /api/posts` - Retrieve all posts
- `GET /api/posts/search?q=query` - Search posts by content
- `POST /api/posts` - Create new anonymous post
- `POST /api/posts/:id/vote` - Vote on posts (up/down)
- `POST /api/posts/:id/report` - Report inappropriate content
- `GET /api/statistics` - Platform usage statistics

### Frontend Components
- **Header**: Search functionality and navigation
- **PostCard**: Individual post display with voting controls
- **NewPostModal**: Post creation interface
- **GuidelinesModal**: Community guidelines display
- **Footer**: Platform information and links

## Data Flow

1. **Post Creation**: User submits content → Validation → Database storage → Anonymous ID generation
2. **Voting System**: User votes → IP hash check → Vote recording → Score update
3. **Content Moderation**: Report submission → Database logging → Automatic flagging at threshold
4. **Search**: Query processing → Database search → Filtered results return

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for PostgreSQL
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for server

### Optional Integrations
- **FontAwesome**: Icon library for UI elements
- **Google Fonts**: Inter font family for typography

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Server**: Express server on port 5000
- **Frontend**: Vite dev server with HMR
- **Database**: PostgreSQL via Replit modules

### Production Build
- **Frontend Build**: Vite builds to `dist/public`
- **Server Bundle**: ESBuild bundles server code
- **Static Serving**: Express serves built frontend
- **Database**: PostgreSQL with connection pooling

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Deployment**: Autoscale with build and run commands
- **Port Configuration**: Internal 5000 → External 80

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.