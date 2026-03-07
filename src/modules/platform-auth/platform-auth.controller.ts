import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PlatformAuthService } from './platform-auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { CurrentPlatformUser } from '../../common/decorators/current-platform-user.decorator';

@Controller('platform-auth')
export class PlatformAuthController {
  constructor(private readonly platformAuthService: PlatformAuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.platformAuthService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.platformAuthService.refresh(refreshDto);
  }

  @UseGuards(JwtPlatformAuthGuard)
  @Post('logout')
  logout(@CurrentPlatformUser() user: any) {
    return this.platformAuthService.logout(user.id);
  }

  @UseGuards(JwtPlatformAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentPlatformUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.platformAuthService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtPlatformAuthGuard)
  @Get('me')
  me(@CurrentPlatformUser() user: any) {
    return this.platformAuthService.me(user.id);
  }
}