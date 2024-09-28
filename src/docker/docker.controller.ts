import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DockerService } from './docker.service';
import { ContainerInfo } from '../types/container.interface';

@Controller('docker')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('containers')
  async listContainers(): Promise<ContainerInfo[]> {
    return this.dockerService.listContainers();
  }

  @Post('containers')
  async createContainer(
    @Body() body: { image: string; tag?: string },
  ): Promise<ContainerInfo> {
    return this.dockerService.createContainer(body.image, body.tag);
  }

  @Post('containers/:id/stop')
  async stopContainer(@Param('id') id: string): Promise<void> {
    await this.dockerService.stopContainer(id);
  }

  @Post('containers/:id/remove')
  async removeContainer(@Param('id') id: string): Promise<void> {
    await this.dockerService.removeContainer(id);
  }

  @Post('images/:name/push')
  async pushImage(
    @Param('name') name: string,
    @Body() body: { tag?: string },
  ): Promise<void> {
    await this.dockerService.pushImageToHub(name, body.tag);
  }
}
