import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 테스트 계정 (개발용 로그인)
const TEST_ACCOUNT = {
  email: 'test@chimppick.com',
  password: 'password123',
  nickname: '테스트침팬지',
};

// 랭킹용 더미 유저
const RANKED_USERS = [
  { nickname: '가즈아전사', wins: 47, losses: 13, streak: 7, coins: 2400 },
  { nickname: '떡상마스터', wins: 38, losses: 22, streak: 3, coins: 1800 },
  { nickname: '바나나헌터', wins: 31, losses: 19, streak: 5, coins: 1550 },
  { nickname: '킹콩트레이더', wins: 25, losses: 25, streak: 0, coins: 1200 },
  { nickname: '손절장인', wins: 12, losses: 38, streak: 0, coins: 450 },
];

const SYMBOLS = ['AAPL', 'TSLA', 'BTC', 'ETH', 'NVDA'];
const TIMEFRAMES = ['1m', '5m', '1h'];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function winRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100) / 100;
}

async function seedTestAccount(): Promise<void> {
  const hashed = await bcrypt.hash(TEST_ACCOUNT.password, 12);
  await prisma.user.upsert({
    where: { email: TEST_ACCOUNT.email },
    update: {},
    create: {
      email: TEST_ACCOUNT.email,
      password: hashed,
      nickname: TEST_ACCOUNT.nickname,
      bananaCoins: 1000,
      isGuest: false,
      stats: { create: {} },
    },
  });
  console.log(`✅ 테스트 계정: ${TEST_ACCOUNT.email} / ${TEST_ACCOUNT.password}`);
}

async function seedRankedUsers(): Promise<void> {
  for (const data of RANKED_USERS) {
    const user = await prisma.user.upsert({
      where: { nickname: data.nickname },
      update: { bananaCoins: data.coins },
      create: {
        nickname: data.nickname,
        bananaCoins: data.coins,
        isGuest: false,
        stats: {
          create: {
            totalPredictions: data.wins + data.losses,
            wins: data.wins,
            losses: data.losses,
            winRate: winRate(data.wins, data.losses),
            currentStreak: data.streak,
            maxStreak: data.streak + randomBetween(0, 5),
          },
        },
      },
    });

    // 기존 stats가 있으면 업데이트
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        totalPredictions: data.wins + data.losses,
        wins: data.wins,
        losses: data.losses,
        winRate: winRate(data.wins, data.losses),
        currentStreak: data.streak,
        maxStreak: data.streak + randomBetween(0, 5),
      },
      create: {
        userId: user.id,
        totalPredictions: data.wins + data.losses,
        wins: data.wins,
        losses: data.losses,
        winRate: winRate(data.wins, data.losses),
        currentStreak: data.streak,
        maxStreak: data.streak + randomBetween(0, 5),
      },
    });

    // 샘플 예측 3건
    const predictions = [];
    for (let i = 0; i < 3; i++) {
      const isWin = i < 2; // 2승 1패
      const entryPrice = randomBetween(100, 50000);
      const exitPrice = isWin
        ? entryPrice * (1 + randomBetween(1, 5) / 100)
        : entryPrice * (1 - randomBetween(1, 5) / 100);
      const betAmount = randomBetween(50, 200);
      const reward = isWin ? Math.floor(betAmount * 1.9) : 0;

      const prediction = await prisma.prediction.create({
        data: {
          userId: user.id,
          symbol: randomChoice(SYMBOLS),
          direction: isWin ? 'UP' : 'DOWN',
          timeframe: randomChoice(TIMEFRAMES),
          entryPrice,
          exitPrice,
          betAmount,
          result: isWin ? 'WIN' : 'LOSE',
          reward,
          createdAt: new Date(Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000),
          resolvedAt: new Date(),
          expiresAt: new Date(),
        },
      });
      predictions.push(prediction);

      // 코인 거래 기록
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: isWin ? 'WIN' : 'LOSE',
          amount: isWin ? reward : -betAmount,
          balanceAfter: data.coins,
          predictionId: prediction.id,
          description: `${prediction.symbol} ${prediction.direction} ${isWin ? '적중' : '실패'}`,
          createdAt: prediction.createdAt,
        },
      });
    }

    console.log(`✅ ${data.nickname}: ${data.wins}승 ${data.losses}패 (${data.coins} 바나나코인)`);
  }
}

async function main(): Promise<void> {
  console.log('🦍 침팬지픽 DB 시딩 시작...\n');

  await seedTestAccount();
  await seedRankedUsers();

  console.log('\n🍌 시딩 완료!');
  console.log('──────────────────────────────────');
  console.log('개발 서버 로그인:');
  console.log(`  이메일: ${TEST_ACCOUNT.email}`);
  console.log(`  비밀번호: ${TEST_ACCOUNT.password}`);
  console.log('──────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
