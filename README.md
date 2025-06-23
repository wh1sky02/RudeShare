# RudeShare 💀

> **Brutal Anonymous Social Media - No Politeness Allowed**

RudeShare is a revolutionary social media platform that flips conventional online discourse on its head. Here, being polite gets you banned, and brutally honest opinions are celebrated. It's anonymous, unfiltered, and designed for those who are tired of fake niceness.

## 🔥 Features

### Core Functionality
- **Anonymous Posting**: Share your thoughts without revealing your identity (assigned random IDs like #A7B9C2)
- **Rudeness Detection**: AI-powered politeness detector that bans overly nice content
- **Brutality Scoring**: Posts are scored on a 0-100 rudeness scale
- **Reactions System**: Express yourself with reactions like 'savage', 'brutal', 'trash', 'boring', 'legendary', and 'middle_finger'
- **Voting System**: Upvote and downvote posts and comments
- **Media Support**: Upload images and videos to accompany your brutal takes

### Special Features
- **Daily Challenges**: Participate in daily prompts designed to bring out maximum rudeness
- **Hall of Shame**: Showcase for the most polite (banned) posts with rude AI responses
- **Boost System**: Extra visibility for exceptionally rude posts
- **Comment Threads**: Full commenting system with anonymous IDs
- **Report System**: Community moderation for inappropriate content

### Anti-Politeness Measures
- **Smart Detection**: Advanced AI identifies and blocks polite language
- **Automatic Bans**: Polite posts are automatically flagged and removed
- **Rude Responses**: AI generates brutal responses to banned polite content
- **Zero Tolerance**: No warnings - politeness results in immediate action

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for state management
- Radix UI components
- Framer Motion for animations

**Backend:**
- Node.js with Express
- TypeScript
- Drizzle ORM
- PostgreSQL database
- Multer for file uploads
- WebSocket support

**Development:**
- ESBuild for production builds
- Hot module replacement
- Mobile-optimized responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wh1sky02/RudeShare.git
   cd RudeShare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📱 Usage

1. **Visit the platform** - No registration required
2. **Read the guidelines** - Understand the rules of brutal honesty
3. **Start posting** - Share your unfiltered thoughts
4. **React and vote** - Engage with other users' content
5. **Participate in challenges** - Join daily brutality challenges
6. **Avoid politeness** - Remember, being nice gets you banned!

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `posts` - User-generated content with rudeness scoring
- `comments` - Threaded discussions
- `votes` & `comment_votes` - Community engagement
- `reactions` - Emotional responses to content
- `reports` - Community moderation
- `banned_polite_posts` - Hall of shame for polite content
- `daily_challenges` - Prompts for community engagement

## 🎯 Project Structure

```
RudeShare/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Backend Express application
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── politeness-detector.ts  # AI content moderation
├── shared/                # Shared types and schemas
└── uploads/               # File upload directory
```

## 🤝 Contributing

We welcome contributions that make the platform even more brutally honest! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure your code is appropriately rude (no polite comments!)
5. Submit a pull request

## ⚠️ Disclaimer

RudeShare is a satirical social media platform designed for entertainment purposes. While we encourage honest communication, please:
- Respect others' dignity
- Avoid harassment or hate speech
- Remember this is meant to be fun, not harmful

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Why RudeShare?

In a world of fake smiles and forced politeness, RudeShare provides a space for authentic, unfiltered expression. Whether you're venting frustrations, sharing unpopular opinions, or just want to experience social media without the pretense, RudeShare has you covered.

**Remember: Be rude or be gone!** 💀

---

*Built with ❤️ and a healthy dose of brutal honesty* 