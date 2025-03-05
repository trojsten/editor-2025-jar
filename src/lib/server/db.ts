import { building } from '$app/environment';
import { Prisma, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

if (!building)
	// do not lazy wait for first connection
	await db.$connect();

export default db;
