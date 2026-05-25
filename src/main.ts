// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptors';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Interceptors - for logging and transforming responses
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  // Global Filters - for handling exceptions
  app.useGlobalFilters(new HttpExceptionFilter());
  // Global Validation Pipe - for validating DTOs and transforming types
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger Strategy 
  const config = new DocumentBuilder()
    .setTitle('Project Management & Workspace  API')
    .setDescription('Complete API documentation for workspaces, tasks, members, and audit logging.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token obtained from the login endpoint',
        in: 'header',
      },
      'JWT-auth', // This is the security name used to link decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
