# Nexus Project (sarge841-utils)

Welcome to the Nexus Project repository. This project hosts a suite of modular web utilities, starting with a high-precision Interval Timer.

## 📂 Project Structure

- **[nexus-app](./nexus-app/)**: The main web application source code (React, TypeScript, Vite).
- **[docs](./docs/)**: Detailed documentation and specifications.

## 📖 Documentation

For a deep dive into the technical design, technology stack, and architectural decisions, please refer to:
👉 **[Architecture Documentation](./docs/architecture.md)**

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- Docker (optional, for containerized deployment)

### Running Locally

```bash
cd nexus-app
npm install
npm run dev
```

### Docker Deployment

```bash
cd nexus-app
docker build -t nexus-app .
docker run -p 8080:80 nexus-app
```

## 🛠️ Key Features

- **Interval Timer**: Precise, worker-based timing with support for complex presets.
- **PWA Support**: Installable on mobile and desktop for offline use.
- **Smart Sharing**: Share workouts via clipboard JSON or ephemeral server links.
