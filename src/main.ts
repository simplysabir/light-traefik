import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProxyService } from './proxy/proxy.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const proxyService = app.get(ProxyService);

  // Use the proxy for all routes
  app.use((req, res, next) => {
    proxyService.handleRequest(req, res).catch(next);
  });

  // Handle WebSocket upgrades
  const server = app.getHttpServer();
  server.on('upgrade', (req, socket, head) => {
    proxyService.handleUpgrade(req, socket, head);
  });

  await app.listen(80);
  console.log('Application is running on: http://localhost');
}
bootstrap();
