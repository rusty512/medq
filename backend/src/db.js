// Prisma Client initialization
import { PrismaClient } from '@prisma/client'

// Create a single prisma client instance for the whole app
export const prisma = new PrismaClient()

export async function connectDatabase() {
  // Simple test query to ensure connection
  await prisma.$queryRaw`SELECT 1`
}


