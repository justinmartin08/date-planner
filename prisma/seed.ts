import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Cielo & Yani...');

  const cieloPassword = await bcrypt.hash('cielo123!', 10);
  const yaniPassword = await bcrypt.hash('yani123!', 10);

  // Cielo: Blue & Pokemon theme
  const cielo = await prisma.user.upsert({
    where: { username: 'cielo' },
    update: { passwordHash: cieloPassword, displayName: 'Cielo', theme: 'pokemon' },
    create: { username: 'cielo', passwordHash: cieloPassword, displayName: 'Cielo', theme: 'pokemon' },
  });

  // Yani: Orange & Tiger theme
  const yani = await prisma.user.upsert({
    where: { username: 'yani' },
    update: { passwordHash: yaniPassword, displayName: 'Yani', theme: 'tiger' },
    create: { username: 'yani', passwordHash: yaniPassword, displayName: 'Yani', theme: 'tiger' },
  });

  console.log(`Users seeded: ${cielo.displayName} (${cielo.theme}), ${yani.displayName} (${yani.theme})`);

  // Ensure clean DB with zero pre-made plans or letters
  await prisma.dateProposal.deleteMany({});
  await prisma.message.deleteMany({});

  console.log('Pre-made plans and letters cleared. Database seeded clean!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
