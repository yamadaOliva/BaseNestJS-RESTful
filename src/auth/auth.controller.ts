import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService.doSomething();
  }
  @Post('/register')
  register() {
    this.authService.register();
  }
  @Post('/login')
  login() {
    this.authService.login();
  }
}
