declare const module: any;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
async function bootstrap() {
  dotenv.config();
  const PORT = process.env.PORT || 3002;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
