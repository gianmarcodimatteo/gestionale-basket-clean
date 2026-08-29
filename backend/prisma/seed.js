import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Maracaibo12', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'gianmarco.dimatteo1807@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'gianmarco.dimatteo1807@gmail.com',
      password: hashedPassword,
      name: 'Gianmarco Admin',
      role: 'ADMIN'
    }
  });
  
  console.log('Admin user created/updated:', admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
