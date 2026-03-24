import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  password: string;

  @ApiProperty({ example: '침팬지왕' })
  nickname: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiProperty()
  user: {
    id: string;
    email: string | null;
    nickname: string;
    avatarLevel: number;
    bananaCoins: number;
    isGuest: boolean;
  };
}
