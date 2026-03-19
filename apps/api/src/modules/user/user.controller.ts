import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';
import { generateId } from '../../mock/data';

function buildResponse(data: unknown) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
    },
  };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    const user = this.userService.getUser(req.user.id);
    return buildResponse(user);
  }

  @UseGuards(AuthGuard)
  @Get('me/stats')
  getMyStats(@Req() req: AuthenticatedRequest) {
    const stats = this.userService.getUserStats(req.user.id);
    return buildResponse(stats);
  }
}
