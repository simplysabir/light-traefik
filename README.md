### **README.md**

# Light-Traefik

**A Lightweight Reverse Proxy for Docker Containers**

Light-Traefik is a minimal, easy-to-use, and efficient reverse proxy server built with NestJS to manage and route Docker containers dynamically based on their subdomains. It simplifies container discovery, routing, and lifecycle management through a straightforward API.

## **Core Highlights**

- **Dynamic Proxy Routing**: Automatically detects Docker containers and routes traffic based on subdomains.
- **RESTful Management API**: Simple API for starting, stopping, listing, and removing Docker containers.
- **Pre-built Docker Image**: Easy to use; simply pull and run.
- **WebSocket Support**: Handles WebSocket upgrades for container-based traffic.

---

## **Quickstart**

### **Using the Pre-built Image**
To get started instantly, pull and run the pre-built Docker image:

1. **Pull the Image**:
    ```bash
    docker pull simplysabir/light-traefik:latest
    ```

2. **Run the Image**:
    ```bash
    docker run -d -p 80:80 -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock simplysabir/light-traefik:latest
    ```

Now, Light-Traefik is up and running! Use the Management API to control Docker containers, and access services through the proxy based on their subdomains.

---

## **Development**

1. **Clone the Repo & Install Dependencies**:
    ```bash
    git clone https://github.com/simplysabir/light-traefik.git
    cd light-traefik
    yarn install
    ```

2. **Run in Development Mode**:
    ```bash
    yarn start:dev
    ```

3. **Test & Lint**:
    ```bash
    yarn test
    yarn test:e2e
    yarn lint
    ```

## **Project Structure**
Here's a high-level overview of the project:
```
src/
├── docker/
│   ├── docker.service.ts       # Manages Docker interactions and events
│   ├── docker.controller.ts    # Provides REST endpoints for Docker operations
│   └── docker.module.ts        # NestJS module for Docker services
├── proxy/
│   ├── proxy.service.ts        # Handles reverse proxy routing and WebSocket forwarding
│   ├── proxy.controller.ts     # Routes incoming HTTP traffic to the proxy service
│   └── proxy.module.ts         # NestJS module for proxy functionalities
├── main.ts                     # Application entry point
└── app.module.ts               # Root application module
```

- **Docker Module**: Manages Docker operations (starting, stopping, listing containers).
- **Proxy Module**: Handles all routing and reverse proxy logic.
- **Global Routing**: All traffic is forwarded based on subdomains using the proxy logic.

---

## **API Reference**

### **Containers API**

- **GET /docker/containers**  
  *List all Docker containers (running & stopped).*
  
  **Response**:
  ```json
  [
    {
      "id": "container_id",
      "name": "/container_name",
      "image": "image_name:tag",
      "state": "running",
      "status": "Up 2 minutes"
    }
  ]
  ```

- **POST /docker/containers**  
  *Create and start a new container.*
  
  **Request Body**:
  ```json
  {
    "image": "nginx",
    "tag": "latest"
  }
  ```

  **Response**:
  ```json
  {
    "id": "container_id",
    "name": "/container_name",
    "image": "nginx:latest",
    "state": "running",
    "status": "Created"
  }
  ```

- **POST /docker/containers/:id/stop**  
  *Stop a running container.*

- **POST /docker/containers/:id/remove**  
  *Remove a container.*

### **Images API**

- **POST /docker/images/:name/push**  
  *Push a Docker image to Docker Hub.*

  **Request Body**:
  ```json
  {
    "tag": "latest"
  }
  ```

---

## **Reverse Proxying**
Light-Traefik automatically maps subdomains to running containers. For example:
- A request to `container1.localhost` is routed to the Docker container named `container1`.

### **WebSocket Support**
Handles WebSocket upgrades transparently, ensuring smooth real-time communication for container-based apps.

---

## **MIT License**
This project is open-source and available under the MIT License. Feel free to use, modify, and contribute!

---

Happy Proxying! 🚀