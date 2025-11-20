# Conference Manager

A comprehensive conference management system for organizing academic conferences, built with Next.js and PostgreSQL. Inspired by the architecture of [TabNews](https://github.com/filipedeschamps/tabnews.com.br).

## Features

### User Roles
- **Authors**: Submit and manage abstracts
- **Reviewers**: Review submissions and provide feedback
- **Organizers**: Manage conferences, schedules, and review assignments

### Core Functionalities
- 📝 Abstract submission and management
- 👥 User authentication with role-based authorization
- 📊 Review workflow with scoring system
- 📅 Conference schedule management
- 📧 Email notifications
- 🔒 Secure session-based authentication

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL
- **Testing**: Vitest
- **Authentication**: Session-based with bcrypt
- **Email**: Nodemailer + React Email
- **Validation**: Joi
- **Migrations**: node-pg-migrate

## Prerequisites

- Node.js 22.x
- Docker and Docker Compose (for local development)
- PostgreSQL 16+ (managed via Docker)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zemarchezi/conference-manager.git
cd conference-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables.

### 4. Start the development environment

```bash
npm run dev
```

This will:
- Start PostgreSQL via Docker
- Run database migrations
- Seed initial data
- Start the Next.js development server on http://localhost:3000

## Development

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with services (database):
```bash
npm run test:watch:services
```

Run specific test files:
```bash
npm test -- abstracts
npm test -- reviews
```

### Database Migrations

Create a new migration:
```bash
npm run migration:create <migration-name>
```

Run migrations:
```bash
npm run migration:run
```

Seed database:
```bash
npm run migration:seed
```

### Code Quality

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

### Email Templates

Preview email templates:
```bash
npm run email
```

## Project Structure

```
conference-manager/
├── infra/                  # Infrastructure
│   ├── database.js
│   ├── email.js
│   ├── migrations/
│   └── scripts/
├── models/                 # Business logic
│   ├── user.js
│   ├── authentication.js
│   ├── authorization.js
│   ├── abstract.js
│   ├── conference.js
│   ├── review.js
│   └── schedule.js
├── pages/                  # Next.js pages
│   ├── api/v1/
│   │   ├── users/
│   │   ├── abstracts/
│   │   ├── conferences/
│   │   ├── reviews/
│   │   └── schedules/
│   ├── conferences/
│   └── index.js
├── tests/                  # Tests
│   ├── integration/
│   │   └── api/v1/
│   ├── orchestrator.js
│   └── setup.js
└── package.json
```

## Database Schema

### Main Tables

- `users` - User accounts with role features
- `conferences` - Conference details
- `abstracts` - Submitted abstracts
- `reviews` - Abstract reviews
- `schedules` - Conference schedule items
- `sessions` - Authentication sessions
- `activate_account_tokens` - Account activation
- `reset_password_tokens` - Password recovery

## API Routes

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:username` - Get user profile
- `PATCH /api/v1/users/:username` - Update user

### Conferences
- `POST /api/v1/conferences` - Create conference (organizer)
- `GET /api/v1/conferences` - List conferences
- `GET /api/v1/conferences/:id` - Get conference details
- `PATCH /api/v1/conferences/:id` - Update conference

### Abstracts
- `POST /api/v1/abstracts` - Submit abstract (author)
- `GET /api/v1/abstracts` - List abstracts
- `GET /api/v1/abstracts/:id` - Get abstract
- `PATCH /api/v1/abstracts/:id` - Update abstract
- `DELETE /api/v1/abstracts/:id` - Delete abstract

### Reviews
- `POST /api/v1/reviews` - Submit review (reviewer)
- `GET /api/v1/reviews` - List reviews
- `GET /api/v1/abstracts/:id/reviews` - Get reviews for abstract

### Schedules
- `POST /api/v1/schedules` - Create schedule item (organizer)
- `GET /api/v1/schedules` - Get conference schedule

## Authorization Features

Users can have the following features:
- `create:user`, `read:user`, `update:user`
- `create:conference` (organizer)
- `create:abstract` (author)
- `create:review` (reviewer)
- `assign:reviewer` (organizer)
- `read:reviews` (organizer, reviewers)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
npm run commit
```

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Architecture inspired by [TabNews](https://github.com/filipedeschamps/tabnews.com.br)
- Built with ❤️ for the academic community
