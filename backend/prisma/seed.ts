import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  const hashPassword = await bcrypt.hash('Password123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'mohamedmrslan@gmail.com',
      name: 'Mohamed Shehata',
      role: 'ADMIN',
      passwordHash: hashPassword,
    },
  });
  console.log('admin created successfully: ', admin);
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
