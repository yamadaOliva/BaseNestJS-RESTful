import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthService {
  doSomething() {
    console.log('Doing something...');
  }
  register() {
    return 'Registering...';
  }
  login() {
    return 'Logging in...';
  }
}
