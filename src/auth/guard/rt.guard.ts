import { AuthGuard } from '@nestjs/passport';
export class RtGuard extends AuthGuard('rt') {
  constructor() {
    super();
  }
}
