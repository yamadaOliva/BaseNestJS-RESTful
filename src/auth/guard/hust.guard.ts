import { AuthGuard } from '@nestjs/passport';

export class HustGuard extends AuthGuard('hust') {
  constructor() {
    super();
  }
}
