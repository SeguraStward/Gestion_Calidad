import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { HttpResponseInterceptor } from '@core/http/interceptors/http-response.interceptor';
import { ErrorResponseFilter } from '@core/http/filters/error-response.filter';

import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new Logger());

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalFilters(new ErrorResponseFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Quality Management API')
    .setDescription('API for Quality Management System')
    .setVersion('1.0')
    .addTag('Quality Management System')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
