import { Injectable, NotFoundException } from '@nestjs/common';
import { findUser, findUserStats, User, UserStats } from '../../mock/data';

@Injectable()
export class UserService {
  getUser(userId: string): User {
    const user = findUser(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  getUserStats(userId: string): UserStats {
    findUser(userId); // existence check
    return findUserStats(userId);
  }

  updateUser(
    userId: string,
    data: Partial<Pick<User, 'nickname' | 'avatarLevel' | 'bananaCoins'>>,
  ): User {
    const user = findUser(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    Object.assign(user, data);
    return user;
  }
}
