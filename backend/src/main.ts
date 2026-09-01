import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  // Serve uploaded dish images at <host>/uploads/<filename>
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FlavorFusion API')
    .setDescription('Restaurant Ordering Backend API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Hosting platforms (Railway, Render, etc.) assign a port dynamically
  // via the PORT env var and route traffic based on it - this MUST be
  // respected, not hardcoded, or the platform can't reach the app.
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 FlavorFusion Backend running on port ${port}`);
  console.log(`📖 Swagger Docs available at /api`);
}

bootstrap();
