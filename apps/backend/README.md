<!-- markdownlint-disable MD033 -->

#

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Gestión de Calidad - Backend - Backend</h1>

<p align="center">
  Backend for the Gestión de Calidad - Backend system of UNA, built with <a href="https://nestjs.com/" target="_blank">NestJS</a> and <a href="https://www.prisma.io/" target="_blank">Prisma</a>.
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-Framework-E0234E.svg" alt="NestJS" /></a>
  <a href="https://pnpm.io/" target="_blank"><img src="https://img.shields.io/badge/pnpm-Fast%20Package%20Manager-4B3263.svg" alt="pnpm" /></a>
  <a href="https://github.com/nestjs/nest" target="_blank"><img src="https://img.shields.io/github/stars/nestjs/nest.svg?style=social" alt="GitHub Stars" /></a>
</p>

---

## Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Build and Run](#build-and-run)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Usage Example](#usage-example)
- [Author](#author)
- [License](#license)

## Description

This project is the backend for the Gestión de Calidad - Backend system of the National University, developed in TypeScript using the [NestJS](https://nestjs.com/) framework and [Prisma ORM](https://www.prisma.io/). It provides a RESTful API for managing users, reports, intellectual productions, academic activities, and more.

It includes JWT authentication, Google integration, data validation, pagination, Swagger documentation, and security best practices.

## Key Features

- Modular and scalable architecture with NestJS
- ORM with Prisma and PostgreSQL support
- JWT authentication and Google OAuth2
- Data validation with class-validator
- Automatic documentation with Swagger
- Unit and e2e testing with Jest
- Support for pnpm as a package manager

## Requirements

- Node.js >= 18.x
- pnpm >= 8.x
- MongoDB (configure in `.env`)

## Installation

```bash
pnpm install
```

## Environment Variables

Configure the necessary environment variables (database, JWT, Google, etc.).

```env
DATABASE_URL=
FRONTEND_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_SECRET=

JWT_SECRET=
JWT_EXPIRATION=
```

## Build and Run

```bash
# Development
pnpm start

# Watch mode (hot reload)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## Testing

```bash
# Unit tests
pnpm test

# End-to-end tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## API Documentation

Once the server is running, access the Swagger documentation at:  
[http://localhost:3000/swagger](http://localhost:3000/swagger)

## Deployment

Refer to the [official NestJS documentation](https://docs.nestjs.com/deployment) for production deployment recommendations.

## Project Structure

- `src/` - Main source code (modules, controllers, services)
- `prisma/` - Database schema and migrations
- `test/` - Unit and integration tests

## Usage Example

```http
GET http://localhost:3000/api/v1/users HTTP/1.1
Content-Type: application/json
```

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pnpm Documentation](https://pnpm.io/)

## Author

This module was developed by:

- Juan C. Camacho Solano ([GitHub: JuanCaUNA](https://github.com/JuanCaUNA))
- Fran Mora Cabezas ([GitHub: FranMoraCz17](https://github.com/FranMoraCz17))
- Angel Stward Segura Mendez ([GitHub: SeguraStward](https://github.com/SeguraStward))
- Esteban Javier Granados Sibaja ([GitHub: EstebanJavierGranadosSibaja](https://github.com/EstebanJavierGranadosSibaja))

## License

MIT

---

<p align="center">
  <em>Developed with ❤️ using NestJS and pnpm</em>
</p>
