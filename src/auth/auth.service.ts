import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthService {
  doSomething() {
    console.log('Doing something...');
  }
  register(): string {
    console.log('test login');
    return 'Registering...';
  }
  login(): string {
    console.log('test login');
    return 'Logging in...';
  }
  testing() {
    console.log('test');
  }
}
