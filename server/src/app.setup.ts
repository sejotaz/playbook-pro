import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { REFRESH_COOKIE } from './modules/auth/auth.controller.js';

/** Configuración común de la app. La usan `main.ts` y los tests e2e para comportarse igual. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    // whitelist + forbidNonWhitelisted: se rechaza cualquier campo que el DTO no declare.
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

/** Documentación interactiva en /api/docs. */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('PlayBook Pro API')
    .setVersion('0.1')
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE)
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
}
