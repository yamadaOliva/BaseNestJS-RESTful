import { AuthGuard } from '@nestjs/passport';

export class HustGuard extends AuthGuard('AzureAD') {
  constructor() {
    super();
  }
}
