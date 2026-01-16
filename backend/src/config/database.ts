import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance with singleton pattern
 * Prevents multiple instances in development hot reload
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

const connectionString = `${process.env.DATABASE_URL}`

// Create Prisma adapter
const adapter = new PrismaPg({ connectionString });

// Initialize Prisma Client with adapter and logging configuration
export const prisma = global.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Test database connection with a real query
 * This is better than $connect() as it actually tests the database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
};

/**
 * Gracefully disconnect Prisma on application shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
