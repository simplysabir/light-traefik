import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerModule } from './docker/docker.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [DockerModule, ProxyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
