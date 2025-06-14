# RudeShare - Brutal Anonymous Social Media Platform

## Overview

RudeShare is a full-stack anonymous social media platform designed for brutal honesty and unfiltered opinions. Users can post anonymously without accounts, but politeness is automatically banned. The platform enforces rudeness through AI content moderation while still prohibiting death threats and harassment for legal compliance.

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
- **Posts Table**: Stores post content with anonymous IDs, scores, timestamps, and media URLs
- **Votes Table**: Tracks upvotes/downvotes with IP-based deduplication
- **Reports Table**: Handles content moderation reports
- **IP Hashing**: Uses SHA-256 to prevent duplicate votes while maintaining anonymity
- **Media Support**: Image and video uploads with file size limits (10MB images, 50MB videos)

### Content Moderation & Privacy
- **No User Accounts**: Completely anonymous posting system
- **Automatic Politeness Detection**: AI system bans posts containing polite language
- **Legal Compliance**: Death threats and harassment still prohibited
- **IP-Based Deduplication**: Prevents spam while maintaining privacy through hashing
- **Anonymous Post IDs**: Generated unique identifiers like #A7B9C2 for each post

### API Structure
- `GET /api/posts?sort=newest|oldest|popular|controversial` - Retrieve all posts with sorting
- `GET /api/posts/search?q=query` - Search posts by content
- `POST /api/posts` - Create new anonymous post (with optional media)
- `POST /api/upload` - Upload images/videos (10MB/50MB limits)
- `POST /api/posts/:id/vote` - Vote on posts (up/down)
- `POST /api/posts/:id/report` - Report inappropriate content
- `POST /api/cleanup` - Manual cleanup of old posts
- `GET /api/statistics` - Platform usage statistics

### Frontend Components
- **Header**: Search functionality, navigation, and sorting controls
- **PostCard**: Individual post display with voting controls and media support
- **NewPostModal**: Post creation interface with file upload capabilities
- **GuidelinesModal**: Community guidelines display
- **Footer**: Platform information and links

## Data Flow

1. **Post Creation**: User submits content/media → File upload (if applicable) → Validation → Database storage → Anonymous ID generation
2. **Media Upload**: File selection → Size/type validation → Multer processing → File storage → URL generation
3. **Voting System**: User votes → IP hash check → Vote recording → Score update
4. **Content Moderation**: Report submission → Database logging → Automatic flagging at threshold
5. **Search & Sorting**: Query/sort processing → Database filtering → Results return with media
6. **Auto Cleanup**: Daily scheduled task removes posts >3 days old with no votes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for PostgreSQL
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **multer**: File upload handling middleware
- **express**: Server framework with static file serving

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
- June 14, 2025: Initial setup with basic anonymous posting (FreedomShare)
- June 14, 2025: Added media upload (images/videos), sorting features, and auto-cleanup of old posts
- June 14, 2025: Transformed to RudeShare - brutal honesty platform with automatic politeness detection and banning system
- June 14, 2025: Implemented three brutal features:
  * Escalating Rudeness Meter (0-100% scoring with auto-boost for savage posts)
  * Softness Hall of Shame (displays banned polite posts with AI responses)
  * Daily Brutal Challenges (rotating prompts to encourage savage content)

## User Preferences

Preferred communication style: Simple, everyday language.
UI Style: Modern, contemporary design with dark theme and sleek styling.
Content Moderation: No report buttons - platform relies on automatic politeness detection only.