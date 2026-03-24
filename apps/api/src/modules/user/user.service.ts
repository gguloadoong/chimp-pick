import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safe } = user;
    return safe;
  }

  async getUserStats(userId: string) {
    const stats = await this.prisma.userStats.findUnique({
      where: { userId },
    });
    if (!stats) throw new NotFoundException('통계 정보를 찾을 수 없습니다.');
    return stats;
  }

  async updateUser(
    userId: string,
    data: Partial<Pick<User, 'nickname' | 'avatarLevel' | 'bananaCoins'>>,
  ): Promise<SafeUser> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...safe } = user;
      return safe;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      throw e;
    }
  }
}
