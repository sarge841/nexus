# Nexus App

Nexus is a modular, advanced interval timer application built with React, TypeScript, and Vite. It features a robust timer engine, PWA support, and granular audio controls.

## 🚀 Getting Started

### Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

3.  **Build for Production**
    ```bash
    npm run build
    ```

### 🐳 Docker (Containerization)

You can build and run the application as a Docker container.

1.  **Build the Image**
    ```bash
    docker build . -t nexus-app
    ```

2.  **Run the Container**
    ```bash
    docker run -p 8080:80 nexus-app
    ```
    Access the app at `http://localhost:8080`.

## 🔄 CI/CD

This project uses **GitHub Actions** to automatically build and publish the Docker image to **GitHub Container Registry (GHCR)**.

-   **Workflow File**: `.github/workflows/docker-publish.yml`
-   **Trigger**: Pushes to `main` branch.
-   **Registry**: `ghcr.io/<username>/<repo>:latest`

To pull and run the latest image from GHCR:
```bash
docker pull ghcr.io/YOUR_USERNAME/sarge841-utils:latest
docker run -p 8080:80 ghcr.io/YOUR_USERNAME/sarge841-utils:latest
```
*(Note: Replace `YOUR_USERNAME` with your GitHub username)*

