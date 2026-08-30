import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Core security Headers
  app.use(helmet());

  // strick no-chache middleware for all API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  })

  // Enable cookie parsing
  app.use(cookieParser())

  // Enable CORS for you React frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Stripes out any fields not defined in the DTO
      transform: true, // Automatically transforms payloads to match DTO types
      forbidNonWhitelisted: true // Throws and error if extra fields are sent
    })
  )

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3110;
  await app.listen(port,() => console.log('server running on port: ', port));
}
bootstrap();
