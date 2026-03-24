import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

function ok(data: unknown) {
  return { success: true, data, meta: { timestamp: new Date().toISOString() } };
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  async getMe(@CurrentUser() user: User) {
    const result = await this.userService.getUser(user.id);
    return ok(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/stats')
  @ApiOperation({ summary: '내 통계 조회' })
  async getMyStats(@CurrentUser() user: User) {
    const stats = await this.userService.getUserStats(user.id);
    return ok(stats);
  }
}
