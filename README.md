# Carpal Client

A Next.js application for managing and displaying Bilinfo dashboard data. This application is designed to run on a VPS and is served through an nginx reverse proxy.

## Overview

Carpal Client is a modern web application built with Next.js that provides a dashboard interface for managing Bilinfo listings, Zoho Desk ticket processing, and Zoho Deal lookup. The application runs on `localhost:3300` and is accessible through `carpal.thenordic.cloud/ui/*` via nginx reverse proxy.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16.1.4 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4.x
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev)
- **Package Manager**: [pnpm](https://pnpm.io)
- **Containerization**: Docker with multi-stage builds

## Project Structure

The project follows a feature-based organization pattern as outlined in `docs/conventions.md`:

```
carpal-client/
├── app/                    # Next.js App Router pages
│   ├── bilinfo-dashboard/  # Bilinfo dashboard feature
│   ├── zoho-desk-ticket/   # Zoho Desk ticket preview and enqueue
│   ├── zoho-deal/          # Zoho Deal lookup and details
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/                    # Core utilities and configurations
│   ├── api/                # API client functions
│   │   ├── bilinfo.ts      # Bilinfo API client
│   │   ├── zoho-desk.ts    # Zoho Desk API client
│   │   └── zoho-deal.ts    # Zoho Deal API client
│   └── utils.ts            # Utility functions
├── types/                  # TypeScript type definitions
│   ├── bilinfo.ts          # Bilinfo types
│   ├── zoho-desk.ts        # Zoho Desk types
│   └── zoho-deal.ts        # Zoho Deal types
├── public/                 # Static assets
└── docs/                   # Documentation
```

For detailed structure guidelines, see [docs/conventions.md](./docs/conventions.md).

## Getting Started

### Prerequisites

- **For local development**: Node.js 20.x or higher, pnpm (recommended) or npm/yarn
- **For Docker**: Docker and Docker Compose

### Installation

#### Option 1: Local Development (without Docker)

1. Clone the repository:
```bash
git clone <repository-url>
cd carpal-client
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure environment variables (see [Environment Variables](#environment-variables) below)

5. Run the development server:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

#### Option 2: Docker Development

1. Clone the repository:
```bash
git clone <repository-url>
cd carpal-client
```

2. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))

3. Build and run with Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To stop the containers:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_BILINFO_SECRET=FAJIfjkisaldfj38459htjngFGD
NEXT_PUBLIC_BILINFO_API_URL=http://localhost:8000/v1/
BILINFO_API_URL=http://localhost:8000/v1/
NEXT_PUBLIC_BILINFO_DEALER_ID=b96ced54-91a4-e911-9877-0050568635ef
```

### ⚠️ Important Notes

- **Production Configuration**: Make sure to update all environment variables with production values before deploying. The example values above are for development only.
- **Security**: Never commit `.env` files to version control. The `.env` file is already included in `.gitignore`.
- **NEXT_PUBLIC_ Prefix**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Use these only for non-sensitive configuration values.

### Environment Variables Explained

- `NEXT_PUBLIC_BILINFO_SECRET`: Secret key for Bilinfo API authentication (exposed to client)
- `NEXT_PUBLIC_BILINFO_API_URL`: Public API URL for backend services (exposed to client). Used by Bilinfo, Zoho Desk, and Zoho Deal features.
- `BILINFO_API_URL`: Server-side API URL for backend services (server-only). Used by Bilinfo, Zoho Desk, and Zoho Deal features.
- `NEXT_PUBLIC_BILINFO_DEALER_ID`: Dealer ID for Bilinfo integration (exposed to client)

**Note**: The Zoho Desk Ticket and Zoho Deal features use the same API URL environment variables (`NEXT_PUBLIC_BILINFO_API_URL` and `BILINFO_API_URL`) to connect to the backend. Ensure your backend is configured to handle Bilinfo, Zoho Desk, and Zoho Deal endpoints.

## Development

### Available Scripts

- `pnpm dev` - Start development server on `http://localhost:3000`
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server (after build)
- `pnpm lint` - Run ESLint to check code quality

### Docker Development

For development with Docker, use the `docker-compose.dev.yml` file:

```bash
# Start development container
docker-compose -f docker-compose.dev.yml up --build

# Stop development container
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

The development container includes hot-reload support and volume mounts for live code changes.

### Code Style

The project follows the conventions outlined in `docs/conventions.md`:
- TypeScript for type safety
- Feature-based organization
- Component colocation
- Consistent naming conventions

## Deployment

### VPS Deployment with Docker

The application is designed to run on a VPS with the following setup:

1. **Application Server**: Runs in Docker container on `localhost:3300`
2. **Reverse Proxy**: nginx proxies requests from `carpal.thenordic.cloud/ui/*` to `localhost:3300`

### Production Deployment with Docker

#### Option 1: Automated CI/CD Deployment (Recommended)

The project includes GitHub Actions workflow for automated deployment:

1. **Push to `main` branch** - Automatically triggers deployment to production
2. **Push to `dev` branch** - Automatically triggers deployment to development

**Required GitHub Secrets:**
- `PROD_HOST` - Production server hostname/IP
- `PROD_SSH_PASSWORD` - SSH password for production server
- `PROD_DIR` - Directory path on production server (e.g., `carpal`)

**Workflow Steps:**
1. Runs tests and linting
2. Builds Docker image and pushes to GitHub Container Registry (GHCR)
3. Deploys to production server via SSH
4. Pulls latest image and updates docker-compose
5. Performs health checks

**Manual Deployment (if needed):**

If you need to deploy manually or the CI/CD fails:

1. **SSH into production server**:
```bash
ssh root@your-production-server
```

2. **Navigate to project directory**:
```bash
cd ~/carpal  # or your PROD_DIR
```

3. **Update IMAGE_TAG in .env.prod**:
```bash
IMAGE_TAG=ghcr.io/your-org/carpal-client:main-abc1234
```

4. **Pull and deploy**:
```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_GITHUB_TOKEN
docker compose -f docker-compose.prod.main.yaml --env-file .env.prod pull
docker compose -f docker-compose.prod.main.yaml --env-file .env.prod up -d
```

#### Option 2: Manual Local Deployment

#### Prerequisites

- Docker and Docker Compose installed on the VPS
- `.env.prod` file configured with production values

#### Steps

1. **Clone and navigate to the project directory**:
```bash
git clone <repository-url>
cd carpal-client
```

2. **Create `.env.prod` file** with production values (see [Environment Variables](#environment-variables))

3. **Build and start the container**:
```bash
docker-compose -f docker-compose.prod.main.yaml --env-file .env.prod up -d --build
```

4. **Check container status**:
```bash
docker-compose -f docker-compose.prod.main.yaml ps
```

5. **View logs**:
```bash
docker-compose -f docker-compose.prod.main.yaml logs -f carpal-client
```

#### Docker Commands

- **Start containers**: `docker-compose -f docker-compose.prod.main.yaml --env-file .env.prod up -d`
- **Stop containers**: `docker-compose -f docker-compose.prod.main.yaml down`
- **Restart containers**: `docker-compose -f docker-compose.prod.main.yaml restart`
- **View logs**: `docker-compose -f docker-compose.prod.main.yaml logs -f`
- **Rebuild after code changes**: `docker-compose -f docker-compose.prod.main.yaml --env-file .env.prod up -d --build`
- **Remove containers and volumes**: `docker-compose -f docker-compose.prod.main.yaml down -v`

#### Using Existing Docker Compose (Production)

If you already have a `docker-compose.yml` file in production, you can integrate this service into it:

```yaml
services:
  carpal-client:
    image: ghcr.io/your-org/carpal-client:latest
    container_name: carpal-client
    ports:
      - "3300:3300"
    environment:
      - NODE_ENV=production
      - PORT=3300
    env_file:
      - .env.prod
    restart: unless-stopped
    networks:
      - your-network
```

Then run:
```bash
docker-compose up -d carpal-client
```

### Nginx Configuration

Example nginx configuration for reverse proxy:

```nginx
server {
    listen 80;
    server_name carpal.thenordic.cloud;

    location /ui/ {
        proxy_pass http://localhost:3300/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Note**: Adjust the configuration according to your specific nginx setup and requirements.

### Docker Image Details

The Dockerfile uses a multi-stage build process:
- **Stage 1 (deps)**: Installs dependencies
- **Stage 2 (builder)**: Builds the Next.js application
- **Stage 3 (runner)**: Creates a minimal production image with only necessary files

The production image runs on port 3300 and uses Next.js standalone output mode for optimal performance.

### Docker Troubleshooting

#### Container won't start
- Check logs: `docker-compose logs carpal-client`
- Verify `.env` file exists and has correct values
- Ensure port 3300 is not already in use: `lsof -i :3300` or `netstat -tulpn | grep 3300`

#### Build fails
- Clear Docker cache: `docker-compose build --no-cache`
- Verify all required files are present (package.json, pnpm-lock.yaml)
- Check disk space: `df -h`

#### Environment variables not working
- Ensure `.env` file is in the project root
- Check that variables are prefixed correctly (`NEXT_PUBLIC_` for client-side)
- Restart container after changing `.env`: `docker-compose restart carpal-client`

#### Permission issues
- The Dockerfile runs as non-root user (`nextjs`) for security
- If you need to debug, you can override the user: `docker-compose exec -u root carpal-client sh`

## Features

### Bilinfo Dashboard
View and manage Bilinfo listings with sorting, filtering, and synchronization capabilities. The dashboard allows you to:
- Fetch and display all Bilinfo listings
- Check listings against Zoho deals
- Sync individual or bulk listings from Zoho to Bilinfo
- Sort and filter listings by various criteria

### Zoho Desk Ticket
Preview and process Zoho Desk tickets with AI-powered lead extraction. This feature provides:
- **Ticket Preview**: View AI-extracted lead data, deal matching results, and payloads before processing
- **Ticket Enqueue**: Queue tickets for background processing
- **AI Analysis**: Automatic extraction of lead information (name, email, car details) from ticket content
- **Deal Matching**: Intelligent matching of tickets to existing Zoho deals based on car ID, price, make, and model
- **Payload Preview**: Preview the exact data that will be sent to Zoho CRM

Access the Zoho Desk Ticket page at `/zoho-desk-ticket`.

### Zoho Deal
Lookup and view detailed information about Zoho CRM deals. This feature provides:
- **Deal Lookup**: Search for deals by Deal ID and retrieve complete deal information
- **Car Details**: View full car information associated with the deal, including make, model, VIN, and all car fields
- **Car Choices**: Display equipment and choices associated with the car (CarChoices)
- **Structured Display**: Organized view of deal data, car details, and equipment in separate cards
- **Complete Data**: Access to all deal fields and related information from Zoho CRM

Access the Zoho Deal page at `/zoho-deal`.

### General Features
- **Modern UI**: Built with shadcn/ui components for a consistent and accessible user interface
- **Type Safety**: Full TypeScript support for better developer experience and fewer runtime errors
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- **Workflow File**: `.github/workflows/deploy.yml`
- **Triggers**: Push to `main` or `dev` branches
- **Process**: Test → Build → Push to GHCR → Deploy to server

For more details, see the workflow file or check the [Deployment](#deployment) section.

## Documentation

- [Project Conventions](./docs/conventions.md) - Detailed folder structure and coding standards

## License

[Add your license information here]

## Support

For questions or issues, please [open an issue](<repository-url>/issues) or contact the development team.
