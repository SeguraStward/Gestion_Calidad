# Quality Management Frontend

This is a [Next.js](https://nextjs.org/) web application bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).  
It serves as the frontend for the Quality Management platform, consuming a REST API to provide a modern, responsive user experience.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Learn More](#learn-more)
- [Deployment](#deployment)
- [Author](#author)

---

## Features

- Google OAuth login for institutional accounts
- Role selection and role-based navigation
- Responsive UI with dark mode support
- Integration with [React Query](https://tanstack.com/query/latest) for API data fetching and caching
- Modular component architecture using a shared UI library
- TypeScript support and strict linting
- Custom hooks and state management with Zustand
- Form validation with React Hook Form and Zod
- Toast notifications and alerts
- Ready for production deployment with Vercel

---

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/JuanCaUNA/gestion-calidad.git
   cd apps/frontend
   ```

2. **Install dependencies (use [pnpm](https://pnpm.io/) for best compatibility):**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**  
   Copy the `.env` file and adjust values as needed (see [Environment Variables](#environment-variables)).

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser to see the app.

You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
JWT_SECRET=your_jwt_secret
NEST_API=http://localhost:3000/api/v1/
NEXT_PUBLIC_GOOGLE_LOGIN_URL=http://localhost:3000/api/v1/auth/google/login
```

- `NEST_API` should point to your backend API base URL.
- `NEXT_PUBLIC_GOOGLE_LOGIN_URL` is used for Google OAuth login.

---

## Available Scripts

- `pnpm dev` — Start the development server on port 3001
- `pnpm build` — Build the app for production
- `pnpm start` — Start the production server on port 3001
- `pnpm lint` — Run ESLint for code quality
- `pnpm test` — Run the test suite

---

## Project Structure

- `src/app/` — Main Next.js app directory (pages, layouts, components)
- `src/components/` — Shared React components
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility libraries (e.g., HTTP client)
- `src/state/` — State management (e.g., Zustand stores)
- `src/providers/` — Context and providers (e.g., Theme, React Query)

---

## Testing

This project uses [Jest](https://jestjs.io/) for unit testing.

- Run all tests:

  ```bash
  pnpm test
  ```

- Run tests in watch mode:

  ```bash
  pnpm test-watch
  ```

- Run tests with coverage:

  ```bash
  pnpm test-coverage
  ```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) — Interactive Next.js tutorial.
- [React Query Docs](https://tanstack.com/query/latest) — Data fetching and caching.
- [Tailwind CSS Docs](https://tailwindcss.com/docs) — Utility-first CSS framework.

You can also check out the [Next.js GitHub repository](https://github.com/vercel/next.js/) for feedback and contributions.

---

## Deployment

The easiest way to deploy your Next.js app is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

## Author

This project was developed by:

- Juan C. Camacho Solano ([GitHub: JuanCaUNA](https://github.com/JuanCaUNA))
- Fran Mora Cabezas ([GitHub: FranMoraCz17](https://github.com/FranMoraCz17))
- Angel Stward Segura Mendez ([GitHub: SeguraStward](https://github.com/SeguraStward))
- Esteban Javier Granados Sibaja ([GitHub: EstebanJavierGranadosSibaja](https://github.com/EstebanJavierGranadosSibaja))
