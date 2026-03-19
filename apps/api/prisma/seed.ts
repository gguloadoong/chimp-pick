import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NICKNAMES = [
  '가즈아전사',
  '떡상마스터',
  '바나나헌터',
  '킹콩트레이더',
  '손절장인',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main(): Promise<void> {
  console.log('Seeding database...');

  for (const nickname of NICKNAMES) {
    const coins = randomBetween(100, 1000);

    const user = await prisma.user.upsert({
      where: { nickname },
      update: {},
      create: {
        nickname,
        bananaCoins: coins,
        isGuest: false,
      },
    });

    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        totalPredictions: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
      },
    });

    console.log(`Created user: ${nickname} (${coins} 바나나코인)`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
