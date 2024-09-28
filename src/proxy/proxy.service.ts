import { Injectable, OnModuleInit } from '@nestjs/common';
import * as httpProxy from 'http-proxy';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class ProxyService implements OnModuleInit {
  private proxy: httpProxy;
  private containerMap: Map<string, { ipAddress: string; port: string }>;

  constructor(private readonly dockerService: DockerService) {
    this.proxy = httpProxy.createProxyServer({});
    this.containerMap = new Map();
  }

  async onModuleInit() {
    await this.initializeContainerMap();
    // Set up event listener for new containers
    this.dockerService.docker.getEvents(
      { filters: { event: ['start', 'stop', 'die'] } },
      (err, stream) => {
        if (err) {
          console.error('Error getting Docker events:', err);
          return;
        }
        stream.on('data', (chunk) => {
          const event = JSON.parse(chunk.toString());
          if (event.Type === 'container') {
            this.initializeContainerMap(); // Refresh the map when container events occur
          }
        });
      },
    );
  }

  private async initializeContainerMap() {
    const containers = await this.dockerService.listContainers();
    this.containerMap.clear();
    for (const container of containers) {
      const containerInfo = await this.dockerService.docker
        .getContainer(container.id)
        .inspect();
      const ipAddress = containerInfo.NetworkSettings.IPAddress;
      const port = Object.keys(
        containerInfo.Config.ExposedPorts || {},
      )[0]?.split('/')[0];
      if (ipAddress && port) {
        this.containerMap.set(container.name.substring(1), { ipAddress, port });
      }
    }
    console.log('Container map initialized:', this.containerMap);
  }

  async handleRequest(req: any, res: any) {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    if (!this.containerMap.has(subdomain)) {
      console.log(`No container found for subdomain: ${subdomain}`);
      res.status(404).send('Not found');
      return;
    }

    const { ipAddress, port } = this.containerMap.get(subdomain);
    const target = `http://${ipAddress}:${port}`;

    console.log(`Forwarding ${hostname} -> ${target}`);

    this.proxy.web(req, res, { target, changeOrigin: true }, (err) => {
      if (err) {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
      }
    });
  }

  handleUpgrade(req: any, socket: any, head: any) {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    if (!this.containerMap.has(subdomain)) {
      console.log(`No container found for WebSocket upgrade: ${subdomain}`);
      socket.destroy();
      return;
    }

    const { ipAddress, port } = this.containerMap.get(subdomain);
    const target = `ws://${ipAddress}:${port}`;

    console.log(`Forwarding WebSocket ${hostname} -> ${target}`);

    this.proxy.ws(req, socket, head, { target }, (err) => {
      if (err) {
        console.error('WebSocket proxy error:', err);
        socket.destroy();
      }
    });
  }
}
