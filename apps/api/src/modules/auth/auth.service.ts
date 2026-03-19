import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  users,
  findUser,
  findUserByEmail,
  generateId,
  sanitizeUser,
  User,
} from '../../mock/data';

@Injectable()
export class AuthService {
  login(
    email: string,
    password: string,
  ): {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
  } {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return {
      accessToken: `mock-jwt-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      user: sanitizeUser(user),
    };
  }

  loginAsGuest(): {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
  } {
    const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
    const guestUser: User = {
      id: `guest-${generateId()}`,
      email: null,
      nickname: `게스트침팬지_${suffix}`,
      password: null,
      avatarLevel: 1,
      bananaCoins: 100,
      isGuest: true,
      createdAt: new Date().toISOString(),
      lastDailyBonus: null,
    };

    users.push(guestUser);

    return {
      accessToken: `mock-jwt-${guestUser.id}`,
      refreshToken: `mock-refresh-${guestUser.id}`,
      user: sanitizeUser(guestUser),
    };
  }

  validateToken(token: string): User | null {
    const match = token.match(/^mock-jwt-(.+)$/);
    if (!match) return null;
    const userId = match[1];
    return findUser(userId) ?? null;
  }

  getProfile(userId: string): User {
    const user = findUser(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}
