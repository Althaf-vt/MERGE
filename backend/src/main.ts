import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trus the Ngrok reverse proxy so secure cookies are set correctly
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Core security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: {policy: 'cross-origin'}
    })
  );

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

  // Dynamic CORS configuration
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (eg: postman, server-to-server, mobile native calls)
      if(!origin) return callback(null, true);

      const isAllowed = 
        origin === process.env.FRONTEND_URL ||
        origin.includes('localhost') ||
        origin.endsWith('.ngrok-free.app') ||
        origin.endsWith('.ngrok.io');

      if(isAllowed){
        callback(null, true);
      }else{
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },

    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
      'Origin',
      'Accept',
      'X-Requested-With'
    ]
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
