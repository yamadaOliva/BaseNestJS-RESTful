import { Controller, Post, Body, UseGuards, Headers, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import { HustGuard, RtGuard } from './guard';
import { GetUser } from './decorator';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService.doSomething();
  }
  @Post('/register')
  register(@Body() body: AuthDTO): Promise<any> {
    return this.authService.register(body);
  }
  @Post('/login')
  login(@Body() body: AuthDTO): Promise<any> {
    return this.authService.login(body);
  }
  @UseGuards(RtGuard)
  @Post('/refresh-token')
  refreshToken(@GetUser() user: any): Promise<any> {
    return this.authService.refreshToken(
      user.user.email,
      user.user.refreshToken,
    );
  }
  @Post('/office365')
  office365(@Body() body: any): Promise<any>{
    return this.authService.loginWith365Office(body);
  }
}
