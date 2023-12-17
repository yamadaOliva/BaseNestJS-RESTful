import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService.doSomething();
  }
  @Post('/register')
  register(): string {
    this.authService.register();
    return 'test';
  }
  @Post('/login')
  login() {
    this.authService.login();
  }
  @Get('/test')
  testing() {
    this.authService.testing();
  }
}
