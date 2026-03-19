import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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

function buildError(code: string, message: string) {
  return {
    success: false,
    error: { code, message },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
    },
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    try {
      const result = this.authService.login(body.email, body.password);
      return buildResponse(result);
    } catch {
      throw new HttpException(
        buildError(
          'INVALID_CREDENTIALS',
          '이메일 또는 비밀번호가 올바르지 않습니다.',
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('guest')
  loginAsGuest() {
    const result = this.authService.loginAsGuest();
    return buildResponse(result);
  }

  @Get('profile')
  getProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        buildError('UNAUTHORIZED', '인증 토큰이 없습니다.'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.slice(7);
    const user = this.authService.validateToken(token);
    if (!user) {
      throw new HttpException(
        buildError('INVALID_TOKEN', '유효하지 않은 토큰입니다.'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    return buildResponse(user);
  }
}
