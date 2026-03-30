import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer from 'puppeteer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'output', 'pdf');
const TMP_DIR = path.join(ROOT, 'tmp', 'pdfs');
const OUTPUT_PDF = path.join(OUTPUT_DIR, 'resumen-app-gestion-calidad-una.pdf');
const PREVIEW_PNG = path.join(TMP_DIR, 'resumen-app-gestion-calidad-una.png');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const content = {
  title: 'Gestión de Calidad - UNA',
  subtitle: 'Resumen de una página basado solo en evidencia del repo',
  whatItIs:
    'Es un sistema web monorepo para la gestión de calidad académica y administrativa de la Universidad Nacional. El repo integra frontend, API, documentación y paquetes compartidos para operar módulos institucionales y de acreditación.',
  whoItsFor:
    'Persona principal: personal administrativo y coordinaciones académicas de la UNA encargadas de calidad, acreditación y mantenimiento de datos. El repo también contempla docentes y administradores por roles.',
  features: [
    'Inicio de sesión institucional con Google, JWT y control por roles y permisos.',
    'Mantenimiento de campus, sedes, facultades, escuelas, carreras, cursos y aulas.',
    'Importación masiva desde Excel de cursos, profesores y cargas académicas.',
    'Gestión SINAES: estructura, evidencias, tipos documentales, consulta e historial.',
    'Almacenamiento de archivos SINAES en Google Drive del usuario administrador.',
    'Gestión de tiempos de jornada, proveedores externos y proyectos institucionales.',
    'Creación, consulta y descarga de informes finales y reportes PDF de cumplimiento.',
  ],
  architecture: [
    '<code>apps/frontend</code>: Next.js 15 + React 19; usa Axios, React Query y Zustand para la interfaz y consumo de API.',
    '<code>apps/backend</code>: NestJS expone <code>/api/v1</code>, Swagger, cookies/CORS, JWT y módulos funcionales cargados en <code>AppModule</code>.',
    '<code>packages/database</code>: Prisma Client sobre MongoDB; <code>packages/ui</code> comparte componentes reutilizables.',
    'Flujo principal: navegador -&gt; frontend -&gt; API REST -&gt; Prisma -&gt; MongoDB; documentos SINAES -&gt; Google Drive.',
    '<code>apps/docs</code>: sitio Docusaurus para documentación técnica y funcional.',
  ],
  gettingStarted: [
    'Instalar dependencias: <code>pnpm install</code>.',
    'Configurar <code>apps/frontend/.env</code> y <code>apps/backend/.env</code> con <code>NEXT_PUBLIC_API_URL</code>, <code>NEXT_PUBLIC_LOGIN</code>, <code>DATABASE_URL</code>, JWT y Google OAuth.',
    'Levantar el entorno: <code>pnpm run dev</code>.',
    'Abrir <code>http://localhost:3001</code>; Swagger queda en <code>http://localhost:3000/swagger</code>.',
  ],
  notFound: [
    'Archivo <code>.env.example</code>: Not found in repo.',
    'Paso documentado para levantar MongoDB local o semillas iniciales: Not found in repo.',
  ],
  sources:
    'Fuentes: README, docs funcionales, manifests, módulos frontend/backend, Prisma y docker-compose.',
};


function section(title, body) {
  const inner = Array.isArray(body)
    ? `<ul>${body.map((item) => `<li>${item}</li>`).join('')}</ul>`
    : `<p>${body}</p>`;

  return `
    <section class="section">
      <h2>${title}</h2>
      ${inner}
    </section>
  `;
}


function buildHtml() {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${content.title}</title>
    <style>
      :root {
        --page-bg: #eef2f7;
        --paper: #ffffff;
        --accent: #c41230;
        --accent-soft: #fee2e2;
        --ink: #111827;
        --muted: #4b5563;
        --line: #e5e7eb;
        --tint: #f8fafc;
        --title-size: 31px;
        --subtitle-size: 12px;
        --section-size: 16px;
        --body-size: 12.8px;
        --small-size: 11px;
        --column-gap: 28px;
        --section-gap: 16px;
      }

      * {
        box-sizing: border-box;
      }

      @page {
        size: A4;
        margin: 0;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--page-bg);
        color: var(--ink);
        font-family: "Segoe UI", "Aptos", Arial, sans-serif;
      }

      body {
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }

      .sheet {
        width: 210mm;
        height: 297mm;
        background: var(--paper);
        padding: 14mm 14mm 15mm;
        overflow: hidden;
        position: relative;
      }

      .accent-bar {
        width: 100%;
        height: 4px;
        background: var(--accent);
        border-radius: 999px;
        margin-bottom: 12px;
      }

      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 18px;
        align-items: start;
        margin-bottom: 14px;
      }

      .title {
        font-size: var(--title-size);
        font-weight: 800;
        line-height: 1.04;
        color: var(--accent);
        margin: 0 0 4px;
      }

      .subtitle {
        margin: 0;
        font-size: var(--subtitle-size);
        line-height: 1.35;
        color: var(--muted);
      }

      .chip {
        align-self: start;
        justify-self: end;
        padding: 8px 11px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: #7f1d1d;
        font-size: calc(var(--small-size) - 0.2px);
        font-weight: 700;
        text-align: center;
        white-space: nowrap;
      }

      .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--column-gap);
        height: calc(100% - 94px);
      }

      .column {
        display: flex;
        flex-direction: column;
        gap: var(--section-gap);
        min-width: 0;
      }

      .section {
        background: linear-gradient(180deg, var(--tint), #ffffff 44%);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
      }

      .section h2 {
        margin: 0 0 7px;
        font-size: var(--section-size);
        line-height: 1.1;
        color: var(--ink);
      }

      .section p,
      .section li {
        margin: 0;
        font-size: var(--body-size);
        line-height: 1.34;
        color: var(--ink);
      }

      .section ul {
        margin: 0;
        padding-left: 16px;
        display: grid;
        gap: 6px;
      }

      .section li::marker {
        color: var(--accent);
      }

      .section code {
        font-family: "Cascadia Code", Consolas, monospace;
        font-size: calc(var(--body-size) - 0.4px);
        background: #f3f4f6;
        border-radius: 5px;
        padding: 1px 4px;
      }

      .section.alert {
        border-color: #fecaca;
        background: linear-gradient(180deg, #fff7f7, #ffffff 55%);
      }

      .footer {
        position: absolute;
        left: 14mm;
        right: 14mm;
        bottom: 8mm;
        padding-top: 5px;
        border-top: 1px solid var(--line);
        font-size: calc(var(--small-size) - 0.3px);
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <div class="accent-bar"></div>
      <header class="header">
        <div>
          <h1 class="title">${content.title}</h1>
          <p class="subtitle">${content.subtitle}</p>
        </div>
        <div class="chip">Lectura rápida</div>
      </header>

      <div class="content">
        <div class="column">
          ${section('Qué es', content.whatItIs)}
          ${section('Para quién es', content.whoItsFor)}
          ${section('Qué hace', content.features)}
        </div>

        <div class="column">
          ${section('Cómo funciona', content.architecture)}
          ${section('Cómo correrlo', content.gettingStarted)}
          <section class="section alert">
            <h2>Vacíos explícitos</h2>
            <ul>${content.notFound.map((item) => `<li>${item}</li>`).join('')}</ul>
          </section>
        </div>
      </div>

      <footer class="footer">${content.sources}</footer>
    </main>
  </body>
</html>`;
}


async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });
}


async function resolveBrowserExecutable() {
  try {
    await fs.access(EDGE_PATH);
    return EDGE_PATH;
  } catch {
    return undefined;
  }
}


async function tuneLayout(page) {
  return page.evaluate(async () => {
    const root = document.documentElement;
    const sheet = document.querySelector('.sheet');
    const content = document.querySelector('.content');

    const apply = (vars) => {
      root.style.setProperty('--title-size', `${vars.title}px`);
      root.style.setProperty('--subtitle-size', `${vars.subtitle}px`);
      root.style.setProperty('--section-size', `${vars.section}px`);
      root.style.setProperty('--body-size', `${vars.body}px`);
      root.style.setProperty('--small-size', `${vars.small}px`);
      root.style.setProperty('--column-gap', `${vars.columnGap}px`);
      root.style.setProperty('--section-gap', `${vars.sectionGap}px`);
    };

    const fits = () =>
      sheet.scrollHeight <= sheet.clientHeight &&
      sheet.scrollWidth <= sheet.clientWidth &&
      content.scrollHeight <= content.clientHeight + 1;

    const vars = {
      title: 31,
      subtitle: 12,
      section: 16,
      body: 12.8,
      small: 11,
      columnGap: 28,
      sectionGap: 16,
    };

    apply(vars);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    while (!fits() && vars.body > 10.8) {
      vars.title -= 0.35;
      vars.subtitle -= 0.1;
      vars.section -= 0.15;
      vars.body -= 0.18;
      vars.small -= 0.12;
      vars.columnGap = Math.max(20, vars.columnGap - 1);
      vars.sectionGap = Math.max(10, vars.sectionGap - 1);
      apply(vars);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return {
      fits: fits(),
      vars,
      sheetHeight: sheet.clientHeight,
      sheetScrollHeight: sheet.scrollHeight,
      contentHeight: content.clientHeight,
      contentScrollHeight: content.scrollHeight,
    };
  });
}


async function countPdfPages(pdfPath) {
  const raw = await fs.readFile(pdfPath, 'latin1');
  const matches = raw.match(/\/Type\s*\/Page\b/g) || [];
  return matches.length;
}


async function main() {
  await ensureDirs();
  const executablePath = await resolveBrowserExecutable();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    defaultViewport: {
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    },
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(), { waitUntil: 'networkidle0' });

    const layout = await tuneLayout(page);
    if (!layout.fits) {
      throw new Error(
        `El contenido no cabe en una sola página. sheet=${layout.sheetScrollHeight}/${layout.sheetHeight}, content=${layout.contentScrollHeight}/${layout.contentHeight}`
      );
    }

    const sheet = await page.$('.sheet');
    if (!sheet) {
      throw new Error('No se pudo ubicar el contenedor principal para la vista previa.');
    }

    await sheet.screenshot({
      path: PREVIEW_PNG,
      type: 'png',
    });

    await page.pdf({
      path: OUTPUT_PDF,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    const pageCount = await countPdfPages(OUTPUT_PDF);
    if (pageCount !== 1) {
      throw new Error(`El PDF salió con ${pageCount} páginas en lugar de 1.`);
    }

    console.log(JSON.stringify({ pdf: OUTPUT_PDF, preview: PREVIEW_PNG, pageCount, layout }, null, 2));
  } finally {
    await browser.close();
  }
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
