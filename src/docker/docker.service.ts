import { Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';
import { ContainerInfo } from '../types/container.interface';

@Injectable()
export class DockerService {
  public docker: Dockerode;

  constructor() {
    this.docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
  }

  async listContainers(): Promise<ContainerInfo[]> {
    const containers = await this.docker.listContainers({ all: true });
    return containers.map((container) => ({
      id: container.Id,
      name: container.Names[0],
      image: container.Image,
      state: container.State,
      status: container.Status,
    }));
  }

  async createContainer(
    image: string,
    tag: string = 'latest',
  ): Promise<ContainerInfo> {
    const fullImageName = `${image}:${tag}`;

    // Check if image exists, pull if not
    const images = await this.docker.listImages();
    const imageExists = images.some(
      (img) => img.RepoTags && img.RepoTags.includes(fullImageName),
    );

    if (!imageExists) {
      await new Promise((resolve, reject) => {
        this.docker.pull(fullImageName, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            this.docker.modem.followProgress(stream, (err, output) => {
              if (err) {
                reject(err);
              } else {
                resolve(output);
              }
            });
          }
        });
      });
    }

    const container = await this.docker.createContainer({
      Image: fullImageName,
      Tty: false,
      HostConfig: {
        AutoRemove: true,
      },
    });

    await container.start();

    const containerInfo = await container.inspect();
    return {
      id: containerInfo.Id,
      name: containerInfo.Name,
      image: fullImageName,
      state: containerInfo.State.Status,
      status: containerInfo.State.Status,
    };
  }

  async stopContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.stop();
  }

  async removeContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.remove({ force: true });
  }

  async pushImageToHub(
    imageName: string,
    tag: string = 'latest',
  ): Promise<void> {
    const image = this.docker.getImage(`${imageName}:${tag}`);
    await new Promise((resolve, reject) => {
      image.push({}, (err, stream) => {
        if (err) {
          reject(err);
        } else {
          this.docker.modem.followProgress(stream, (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          });
        }
      });
    });
  }
}
