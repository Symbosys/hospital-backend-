import "dotenv/config";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Institutional Database Handshake Protocol (Using Specialized Neon HTTP Adapter)
const DB_URL = process.env.DATABASE_URL!;

const adapter = new PrismaNeonHttp(DB_URL);
const prisma = new PrismaClient({ adapter: adapter as any });

export { prisma };