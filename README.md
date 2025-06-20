# Gestión de la Calidad – Monorepo

System for managing the academic and administrative quality of the National University.

---

## Table of Contents

- [General Description](#general-description)
- [Monorepo Structure](#monorepo-structure)
- [Requirements](#requirements)
- [Installation and Getting Started](#installation-and-getting-started)
- [Useful Commands](#useful-commands)
- [Development and Builds](#development-and-builds)
- [Testing](#testing)
- [Documentation](#documentation)
- [Recommended Extensions for VS Code](#recommended-extensions-for-vs-code)
- [Authors](#authors)
- [License](#license)

---

## General Description

This monorepo contains all applications and packages related to the Gestión de la Calidad system, including frontend, backend, shared UI, and documentation.

---

## Monorepo Structure

```txt
.
├── apps/
│   ├── backend/    # RESTful API (NestJS + Prisma)
│   ├── frontend/   # Web application (Next.js)
│   └── docs/       # Documentation (Docusaurus)
├── packages/
│   ├── ui/         # Shared UI components
│   └── eslint-config/ # Shared ESLint configuration
├── pnpm-lock.yaml
├── package.json
└── README.md
```

---

## Requirements

- Node.js >= 18.x
- pnpm >= 8.x

---

## Installation and Getting Started

```bash
# Install pnpm if you don't have it
npm install -g pnpm@latest

# Install dependencies
pnpm install

# Start all apps in development mode
pnpm run dev
```

---

## Useful Commands

```bash
# Add UI component (shadcn/ui)
pnpm run ui add table pagination sidebar avatar

# Add a package to a specific package
pnpm --filter @una-gc/backend add dotenv

# Add a development dependency
pnpm --filter @una-gc/backend add -D typescript

# Generate Prisma Client
pnpm run prisma

# Build all apps
pnpm run build
```

---

## Development and Builds

- **Frontend:** [`apps/frontend/README.md`](apps/frontend/README.md)
- **Backend:** [`apps/backend/README.md`](apps/backend/README.md)
- **Documentation:** [`apps/docs/README.md`](apps/docs/README.md)

Each app has its own README with specific instructions.

---

## Testing

Run unit and integration tests from the root or from each app:

```bash
pnpm --filter @una-gc/backend test
pnpm --filter @una-gc/backend test:e2e
pnpm --filter @una-gc/backend test:cov
```

---

## Documentation

The functional and technical documentation is in [`apps/docs`](apps/docs).  
You can serve the documentation locally:

```bash
pnpm --filter @una-gc/docs start
```

Access the documentation at [http://localhost:5000](http://localhost:5000).

---

## Recommended Extensions for VS Code

- Code Spell Checker
- Prisma
- ESLint
- Prettier

---

## Authors

This project was developed by:

- Juan C. Camacho Solano ([GitHub: JuanCaUNA](https://github.com/JuanCaUNA))
- Fran Mora Cabezas ([GitHub: FranMoraCz17](https://github.com/FranMoraCz17))
- Angel Stward Segura Mendez ([GitHub: SeguraStward](https://github.com/SeguraStward))
- Esteban Javier Granados Sibaja ([GitHub: EstebanJavierGranadosSibaja](https://github.com/EstebanJavierGranadosSibaja))

---

## License

MIT

---
