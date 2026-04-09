# Capítulo V: Pruebas del Sistema

Este documento recopila la evidencia de la ejecución y el diseño de la estrategia de pruebas (Testing) implementada en el backend del proyecto **Gestión Calidad**, utilizando el framework **NestJS** en conjunto con **Jest** y **Supertest**.

---

## 1. Pruebas Unitarias (15 puntos)

*Esta sección demuestra cómo el desarrollador ha implementado y ejecutado pruebas técnicas para asegurar la calidad de la lógica de negocio.*

### A. Estrategia y Herramientas utilizadas
Se desarrollaron pruebas unitarias enfocadas en validar exclusivamente la lógica de los **Servicios** (`.service.ts`), simulando (mocking) el acceso a datos y las dependencias externas. 
- **Herramienta principal:** `Jest` (Framework de pruebas para Node.js).
- **Aislamiento:** Se utilizó `jest.Mocked` y abstracciones como `Test.createTestingModule` para reemplazar la base de datos (`PrismaService`) o componentes de terceros (por ejemplo, `Puppeteer` para la generación de los reportes PDF).

### B. Evidencia de Código (Ejemplo de Prueba Técnica)
En el siguiente ejemplo correspondiente al módulo **Questions** (`questions.service.spec.ts`), se evidencia cómo se aísla la función de recuperar preguntas por etapa evaluando directamente la lógica sin tocar la base de datos:

```typescript
  describe('getQuestionsByStep', () => {
    it('Debe consultar preguntas según paso y opcionalmente tipo de reporte', async () => {
      // 1. Arrange (Preparar) - Simular el repositorio para que responda datos controlados
      repository.findAll.mockResolvedValue({ 
        data: [mockQuestion as any], 
        meta: { total: 1 } 
      } as any);

      // 2. Act (Actuar) - Invocar la acción en el Servicio
      const result = await service.getQuestionsByStep(1, 'FINAL_REPORT');

      // 3. Assert (Verificar) - Validar el comportamiento y los parámetros correctos
      expect(repository.findAll).toHaveBeenCalledWith(
        1, 100,
        { stepNumber: 1, status: 'ACTIVE', appliesTo: { has: 'FINAL_REPORT' } },
        { createdAt: 'asc' },
        { group: true }
      );
      expect(result.data).toHaveLength(1);
    });
  });
```

### C. Evidencia de Ejecución (Reporte Técnico)
**[RECOMENDACIÓN PARA EL DOCUMENTO FINAL]**: *Aquí debes insertar captura de pantalla de la terminal mostrando todos los "PASS" en verde cuando corrimos las pruebas de la Fase 10 o la Fase 9, demostrando que pasaste las pruebas unitarias. También se recomienda incluir una captura de pantalla del reporte HTML generado en `apps/backend/coverage/lcov-report/index.html`.*

---

## 2. Pruebas Modulares / Integración (20 puntos)

*Esta sección demuestra la interrelación entre distintos módulos, conectando Componentes, Controladores, Guardias (Guards), Validadores (Pipes) y Servicios de forma consolidada.*

### A. Estrategia y Enfoque Modular
Para probar la comunicación de los módulos completos sin levantar la infraestructura entera de producción, se implementaron pruebas de integración/modulares mediante **`Supertest`**. Estas pruebas inicializan una instancia virtual de la aplicación (Network API), validan las rutas HTTP reales y comprueban cómo interactúan las diversas capas del Framework (Guards -> Pipes de validación de los DTOs -> Controlador genérico -> Servicio -> Repositorios).

En estas pruebas modulares simulamos el contexto de seguridad (Autenticación y Permisos), garantizando que los bloqueos de interrelación respondan adecuadamente ante estímulos externos HTTP.

### B. Evidencia de Interrelación de Componentes
A continuación, se observa un fragmento real correspondiente al módulo **Projects** (`projects.module.spec.ts`). Aquí se interrelaciona:
1. El **Controlador** (Endpoints de red).
2. Los **Guards Globales** (`JwtAuthGuard`, `AuditFieldsGuard`, `PermissionsGuard`) que fueron manipulados y vinculados al entorno de pruebas.
3. El **Gestor de Validaciones** (`ValidationPipe`) encargado de interceptar DTOs incorrectos de peticiones maliciosas simuladas con `supertest`.

```typescript
describe('ProjectsModule (Modular - Interrelación)', () => {
  let app: INestApplication;
  
  beforeEach(async () => {
    // Se interrelacionan todas las dependencias del módulo original
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ProjectsModule], // Importación completa del módulo real
    })
      // Sobrescribimos la capa de seguridad y contexto entre peticiones
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { id: 'user-1', email: 'test@una.cr' };
          return true;
        },
      })
      .overrideProvider(PrismaService).useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    
    // Interrelación con la validación de Payload global
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  describe('POST /projects', () => {
    it('Flujo completo: Interrelación HTTP -> Guard -> Validation -> Controller -> DB', async () => {
      // Enviamos el requerimiento simulando una petición web natural a NestJS
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Project Alpha' })
        .expect(201); // Comprobamos que el Framework procesó todo por cada capa de forma correcta

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Project Alpha');
    });
  });
```

### C. Evidencia de Ejecución e Interconexión de Capas
Este tipo de test probó no solo el módulo interno de un elemento de negocio, sino cómo la capa REST delega a los decoradores (`@Expose`, `@IsString`) validaciones de los **DTOs (Data Transfer Objects)**. 

**[RECOMENDACIÓN PARA EL DOCUMENTO FINAL]**: *Aquí debes poner una captura de pantalla demostrando cómo al correr alguna de estas pruebas de módulo (`pnpm test --testPathPattern="projects.module.spec|users.module.spec"`) todo pasó, y podrías mencionar en el texto que se probó intencionalmente el rechazo de peticiones (código 400 Bad Request) para evidenciar que las piezas de validación del módulo se comunican exitosamente con el enrutador central.*
