import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS cho frontend React
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log('Backend server is running on http://localhost:3000');
}
bootstrap();
