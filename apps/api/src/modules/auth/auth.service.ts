import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

type SafeUser = Omit<User, 'password'>;

function sanitize(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...safe } = user;
  return safe;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isGuest: user.isGuest,
    };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken };
  }

  async register(email: string, password: string, nickname: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { nickname }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === email
          ? '이미 사용 중인 이메일입니다.'
          : '이미 사용 중인 닉네임입니다.',
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        nickname,
        stats: { create: {} },
      },
    });

    const tokens = this.issueTokens(user);
    return { ...tokens, user: sanitize(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokens = this.issueTokens(user);
    return { ...tokens, user: sanitize(user) };
  }

  async loginAsGuest() {
    const suffix = Math.floor(Math.random() * 90000 + 10000).toString();
    const user = await this.prisma.user.create({
      data: {
        nickname: `게스트침팬지_${suffix}`,
        isGuest: true,
        bananaCoins: 100,
        stats: { create: {} },
      },
    });

    const tokens = this.issueTokens(user);
    return { ...tokens, user: sanitize(user) };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    return sanitize(user);
  }
}
