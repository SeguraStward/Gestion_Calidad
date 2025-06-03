import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { HttpResponseInterceptor } from '@core/http/interceptors/http-response.interceptor';
import { ErrorResponseFilter } from '@core/http/filters/error-response.filter';
// import { AuditFieldsInterceptor } from '@core/common/interceptors/audit-fields.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new Logger());
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.use(helmet());

  // app.useGlobalInterceptors(new AuditFieldsInterceptor());
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

  await app.listen(3000);
}
bootstrap();
