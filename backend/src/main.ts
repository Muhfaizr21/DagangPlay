import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.enableCors();

  // Expose local file uploads path
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Request logger
  app.use((req: any, res: any, next: any) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    if (!req.headers.authorization) {
      console.log(`      No Authorization header found!`);
    } else {
      console.log(`      Auth Header present: ${req.headers.authorization.substring(0, 20)}...`);
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}
// Triggering reload to pick up new chat module
bootstrap();
