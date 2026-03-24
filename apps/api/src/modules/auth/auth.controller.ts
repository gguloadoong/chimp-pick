import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

function ok(data: unknown) {
  return { success: true, data, meta: { timestamp: new Date().toISOString() } };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.register(
      body.email,
      body.password,
      body.nickname,
    );
    return ok(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password);
    return ok(result);
  }

  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '게스트 로그인' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async loginAsGuest() {
    const result = await this.authService.loginAsGuest();
    return ok(result);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  async getProfile(@CurrentUser() user: User) {
    return ok(user);
  }
}
