import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'martatavarnelli12@gmail.com' },
      data: { role: 'VIEWER' },
    });
    console.log('✅ User role updated:', user);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserRole();
