# Spam Detection API

This project implements a REST API for a mobile app that manages contacts, detects spam, and allows users to search for phone numbers. It's built using TypeScript, Bun, and the Hono framework, with PostgreSQL(neon postgres) as the database and Drizzle ORM for database operations.

spam-detection-api/

├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   ├── contacts.ts
│   │   ├── search.ts
│   │   ├── history.ts
│   │   └── spam.ts
│   ├── middlewares/
│   │   └── auth.ts
│   ├── utils/
│   ├── schema.ts
│   └── index.ts
├── scripts/
│   └── populate-data.ts
├── drizzle/
│   └── migrations/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

## Features

- User registration and authentication
- Contact management
- Call history tracking
- Spam reporting and detection (history is used to verify every reported spams)
- Name and phone number search functionality

## Prerequisites

- Bun runtime
- PostgreSQL database (Neon serverless)
- npm or bun package manager

## Installation

1. Clone the repository:
2. Install dependencies:
3. Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time (e.g., "1d" for one day)

Create a `.env` file in the root directory and add these variables.

3. Run database migrations:
   - `bun run generate`: Generate Drizzle ORM migrations
   - `bun run migrate`: Apply Drizzle ORM migrations
4. Populate the database with sample data:
   - `bun run populate`: Populate the database with sample data

## Usage

To start the development server: - `bun run dev`: Start the development server with watch mode

The API will be available at `http://localhost:3000` by default.

## API Endpoints

### Authentication

- `POST /api/user/register`: Register a new user
- `POST /api/user/login`: Login and receive a JWT token

### Contacts

- `POST /api/contacts`: Add a new contact
- `GET /api/contacts`: Get all contacts
- `GET /api/contacts/myContacts`: Get user's contacts
- `POST /api/contacts/myContacts`: Add a contact for the authenticated user

### Search

- `GET /api/search/name/:name`: Search contacts by name
- `GET /api/search/phone/:phoneNumber`: Search contacts by phone number

### Call History

- `POST /api/history`: Create a new call history entry
- `GET /api/history`: Retrieve call history for the authenticated user

### Spam

- `GET /api/spam/count/:phoneNumber`: Get spam report count for a phone number
- `POST /api/spam/report`: Report a phone number as spam ( history check will ensure that the report is genune )

### Health Check

- `GET /api/health`: Check the API's health status

## Scripts

- `bun run start`: Start the production server
- `bun run dev`: Start the development server with watch mode
- `bun run generate`: Generate Drizzle ORM migrations
- `bun run migrate`: Apply Drizzle ORM migrations
- `bun run studio`: Start Drizzle Studio for database management
- `bun run populate`: Populate the database with sample data

## Security

- JWT authentication is implemented for protected routes
- Password hashing is used for user security
- Input validation is performed using Zod schemas

## Performance Considerations

- Database indexes are used for optimized querying
- Pagination is implemented for search results and call history
