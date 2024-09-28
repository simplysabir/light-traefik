import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { DockerService } from 'src/docker/docker.service';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService, DockerService],
})
export class ProxyModule {}
