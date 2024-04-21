import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import { RtGuard } from './guard';
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
    console.log(body);
    return this.authService.login(body);
  }
  @UseGuards(RtGuard)
  @Post('/refresh-token')
  refreshToken(@GetUser() user: any): Promise<any> {
    console.log(user);
    return this.authService.refreshToken(
      user.user.email,
      user.user.refreshToken,
    );
  }

  @Post('/office365')
  office365(@Body() body: any) {
    return this.authService.loginWith365Office(body);
  }
}
