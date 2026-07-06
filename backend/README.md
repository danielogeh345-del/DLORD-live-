# DLORD Live - Backend API

A comprehensive backend API for DLORD Live, a social media live streaming platform built with NestJS, TypeORM, and PostgreSQL.

## Features

### Authentication & Authorization
- User registration and login with JWT
- Role-based access control (User, Creator, Admin)
- Secure password hashing with bcrypt
- Token refresh mechanism

### User Management
- Profile creation and updates
- User verification and badges
- Profile statistics (followers, following, videos, streams)
- Bio, profile picture, and cover image support

### Social Features
- Follow/unfollow users
- Get followers and following lists
- Block users
- Get blocked users list

### Videos
- Video upload and management
- Video publishing and drafts
- Video likes and comments
- Video search functionality
- Feed generation
- Video statistics (views, likes, comments, shares)

### Live Streaming
- Stream creation and scheduling
- Start/end live streams
- Viewer count tracking
- Peak viewers tracking
- Co-hosting support

### Messaging
- Direct messaging between users
- Message types (text, media, gifts)
- Read status tracking
- Message deletion

### Notifications
- Real-time notifications
- Multiple notification types (follow, like, comment, gift, message, stream)
- Unread count tracking
- Mark as read functionality

### Payments & Wallet
- Wallet system for each user
- Transaction history
- Support for multiple payment methods
- Gift sending with wallet deduction
- Withdrawal functionality

### Admin Panel
- Report management system
- User suspension/unsuspension
- Admin action logging
- Content moderation tools

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/dlord-live.git
cd dlord-live/backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start PostgreSQL database
```bash
# Using Docker
docker run --name dlord-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dlord_live -p 5432:5432 -d postgres:14
```

5. Run the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`
API documentation available at `http://localhost:3000/api/docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles` - Update profile
- `GET /api/profiles/:userId/stats` - Get user statistics

### Social
- `POST /api/social/follow/:userId` - Follow user
- `POST /api/social/unfollow/:userId` - Unfollow user
- `GET /api/social/followers/:userId` - Get followers
- `GET /api/social/following/:userId` - Get following

### Videos
- `POST /api/videos` - Create video
- `GET /api/videos/:videoId` - Get video
- `PUT /api/videos/:videoId` - Update video
- `DELETE /api/videos/:videoId` - Delete video
- `POST /api/videos/:videoId/like` - Like video
- `POST /api/videos/:videoId/unlike` - Unlike video
- `POST /api/videos/:videoId/comments` - Add comment
- `GET /api/videos/:videoId/comments` - Get comments
- `GET /api/videos/feed` - Get video feed
- `GET /api/videos/search` - Search videos

### Streaming
- `POST /api/streams` - Create stream
- `POST /api/streams/:streamId/start` - Start stream
- `POST /api/streams/:streamId/end` - End stream
- `GET /api/streams/:streamId` - Get stream details
- `GET /api/streams/live` - Get live streams
- `POST /api/streams/:streamId/join` - Join stream
- `POST /api/streams/:streamId/leave` - Leave stream

### Messaging
- `POST /api/messages/:receiverId` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `POST /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete message

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:notificationId/read` - Mark notification as read
- `POST /api/notifications/mark-all-as-read` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Payments
- `GET /api/payments/wallet` - Get wallet balance
- `POST /api/payments/process` - Process payment
- `POST /api/payments/withdraw` - Withdraw funds
- `GET /api/payments/transactions` - Get transaction history

### Admin
- `POST /api/admin/reports` - Create report
- `GET /api/admin/reports` - Get all reports (admin only)
- `POST /api/admin/reports/:reportId/resolve` - Resolve report (admin only)
- `POST /api/admin/users/:userId/suspend` - Suspend user (admin only)
- `POST /api/admin/users/:userId/unsuspend` - Unsuspend user (admin only)
- `GET /api/admin/actions` - Get admin actions (admin only)

## Database Schema

The database includes the following tables:
- users
- profiles
- follows
- blocks
- videos
- video_likes
- video_comments
- streams
- stream_viewers
- messages
- notifications
- transactions
- wallets
- reports
- admin_actions

## Project Structure

```
src/
├── auth/              # Authentication module
├── profile/           # User profile module
├── social/            # Social features module
├── videos/            # Videos module
├── streaming/         # Live streaming module
├── messaging/         # Direct messaging module
├── notifications/     # Notifications module
├── payments/          # Payment & wallet module
├── admin/             # Admin & moderation module
├── common/            # Shared utilities, guards, decorators
├── app.module.ts      # Main application module
└── main.ts            # Application entry point
```

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Docker Deployment

```bash
# Build Docker image
docker build -t dlord-live-backend .

# Run container
docker run -p 3000:3000 --env-file .env dlord-live-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository.
