# Backend Boilerplate - Express + TypeScript + Prisma + Zod

A professional and scalable backend boilerplate built with modern technologies and clean architecture principles.

## 🚀 Tech Stack

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Robust relational database
- **Prisma** - Next-generation ORM
- **Zod** - TypeScript-first schema validation
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, env)
│   ├── controllers/     # Request/response handlers
│   ├── services/        # Business logic layer
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Express middlewares (error handling, validation)
│   ├── types/           # TypeScript types and Zod schemas
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables
├── .gitignore
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Setup Database

Make sure PostgreSQL is running, then initialize the database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 4. Run the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
# Build the project
npm run build

# Start the server
npm start
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### Health Check
- **GET** `/api/health` - Check if server is running

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```
- **PUT** `/api/users/:id` - Update user
  ```json
  {
    "email": "newemail@example.com",
    "name": "Jane Doe"
  }
  ```
- **DELETE** `/api/users/:id` - Delete user

## 🏗️ Architecture Highlights

### Layered Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic and database operations
- **Routes**: Define API endpoints and apply middleware
- **Middlewares**: Handle cross-cutting concerns (validation, error handling)

### Type Safety
- Strict TypeScript configuration for maximum type safety
- Zod schemas for runtime validation
- Prisma for type-safe database queries

### Error Handling
- Global error handler catches all errors
- Custom error classes for different HTTP status codes
- Consistent error response format
- Async error handling with try-catch wrapper

### Validation
- Request validation using Zod schemas
- Type-safe input validation
- Detailed error messages for invalid requests

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:push` | Push schema changes to database |

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/db` |

## 🧪 Testing the API

You can test the API using:
- **cURL**
- **Postman**
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

Example cURL request:
```bash
# Create a new user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Get all users
curl http://localhost:5000/api/users
```

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)

## 📄 License

ISC
