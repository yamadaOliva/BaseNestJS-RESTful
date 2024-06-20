import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Get,
  Put,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import { JwtGuard, RtGuard } from './guard';
import { GetUser } from './decorator';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/register')
  register(@Body() body: AuthDTO): Promise<any> {
    return this.authService.register(body);
  }
  @Post('/login')
  login(@Body() body: AuthDTO): Promise<any> {
    return this.authService.login(body);
  }
  @UseGuards(RtGuard)
  @Post('/refreshToken')
  refreshToken(@GetUser() user: any): Promise<any> {
    return this.authService.refreshToken(
      user.user.email,
      user.user.refreshToken,
    );
  }
  @Post('/office365')
  office365(@Body() body: any): Promise<any> {
    return this.authService.loginWith365Office(body);
  }
  @UseGuards(JwtGuard)
  @Put('/logout')
  logout(@GetUser() user: any): Promise<any> {
    return this.authService.logout(user.user.email);
  }

  @Get('/active/:token')
  active(@Param('token') token: string): Promise<any> {
    return this.authService.activeAccount(token);
  }

  @Post('/forgot-password')
  forgotPassword(@Body() body: any): Promise<any> {
    return this.authService.forgotPassword(body.email);
  }

  @Post('/verify-forgot-password/')
  verifyResetPassword(@Body('token') token: string): Promise<any> {
    return this.authService.verifyResetPasswordToken(token);
  }

  @Post('/reset-password')
  resetPassword(@Body() body: any): Promise<any> {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtGuard)
  @Post('/change-password')
  changePassword(@GetUser() user: any, @Body() body: any): Promise<any> {
    return this.authService.changePassword(
      user.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }
}
