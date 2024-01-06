declare const module: any;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as morgran from 'morgan';
import * as compression from 'compression';
async function bootstrap() {
  dotenv.config();
  const PORT = process.env.PORT || 3002;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT_REACT = process.env.PORT_REACT || 'http://localhost:3000';
  const corsOptions: CorsOptions = {
    origin: [PORT_REACT, 'http://192.168.1.13:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  console.log(PORT_REACT);
  //init middleware
  app.enableCors(corsOptions);
  app.use(morgran('dev'));
  app.use(compression());
  //start server
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
