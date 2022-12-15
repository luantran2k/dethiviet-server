import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import * as serveIndex from 'serve-index';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  const PORT = process.env.PORT || 3000;
  // app.useStaticAssets();
  // const index = serveIndex('uploads', { icons: true });
  app.useStaticAssets('uploads');
  app.use('/uploads', serveIndex('uploads', { icons: true }));

  const config = new DocumentBuilder()
    .setTitle('Exam')
    .setDescription('The Exam API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT, () => {
    console.log('running on PORT: ' + PORT);
  });
}
bootstrap();
