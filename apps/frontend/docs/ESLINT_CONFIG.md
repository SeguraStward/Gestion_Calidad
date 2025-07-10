# Configuración de ESLint

Este proyecto está configurado con ESLint para detectar y prevenir errores comunes en TypeScript/JavaScript. La configuración incluye reglas específicas para:

## 🔍 Detección de Imports Inexistentes

- `import/no-unresolved`: Detecta imports que no pueden ser resueltos
- `import/named`: Verifica que los imports nombrados existan
- `import/default`: Verifica imports por defecto
- `import/namespace`: Verifica imports de namespace

## 🧹 Detección de Imports Sin Uso

- `unused-imports/no-unused-imports`: Elimina imports no utilizados
- `unused-imports/no-unused-vars`: Detecta variables no utilizadas
- `import/no-unused-modules`: Detecta módulos exportados pero no utilizados

## 🔒 Detección de Métodos/Propiedades Inexistentes

- `@typescript-eslint/no-unsafe-member-access`: Previene acceso a propiedades no seguras
- `@typescript-eslint/no-unsafe-call`: Previene llamadas no seguras
- `@typescript-eslint/no-unsafe-assignment`: Previene asignaciones no seguras

## 📋 Scripts Disponibles

```bash
# Ejecutar linting básico
pnpm lint

# Ejecutar linting con auto-corrección
pnpm lint:fix

# Ejecutar linting estricto (sin warnings)
pnpm lint:strict

# Corregir solo imports no utilizados
pnpm lint:unused

# Verificar tipos TypeScript
pnpm type-check

# Linting + verificación de tipos
pnpm lint:check
```

## ⚙️ Configuración de VS Code

El archivo `.vscode/settings.json` está configurado para:

- Auto-corrección al guardar
- Organización automática de imports
- Eliminación de imports no utilizados
- Mostrar errores en tiempo real

## 🚀 Uso

1. **Desarrollo en tiempo real**: ESLint se ejecuta automáticamente mientras escribes código
2. **Al guardar**: Se auto-corrigen los errores que pueden ser arreglados automáticamente
3. **Antes de commit**: Ejecuta `pnpm lint:check` para asegurar que no hay errores
4. **CI/CD**: El linting se ejecuta durante el build

## 🔧 Personalización

Si necesitas personalizar las reglas, edita el archivo `.eslintrc.ts`. Las reglas están organizadas por categorías para facilitar su mantenimiento.

- Configuración base de Next.js con `next/core-web-vitals`
- Reglas de TypeScript con `@typescript-eslint/recommended`
- **Plugin de imports** con `plugin:import/recommended` y `plugin:import/typescript`
- Detección de variables no utilizadas
- Advertencias para el uso de `any`
- Validación de React Hooks
- Reglas de buenas prácticas de JavaScript/TypeScript

### TypeScript

- Verificación estricta de tipos habilitada (`strict: true`)
- **Detección de imports inexistentes** ✅
- **Detección de variables no utilizadas** (`noUnusedLocals`, `noUnusedParameters`)
- **Verificación de propiedades opcionales exactas** (`exactOptionalPropertyTypes`)
- **Detección de código inalcanzable** (`allowUnreachableCode: false`)
- Validación de módulos faltantes
- Sugerencias de autocompletado mejoradas

### Nuevas reglas añadidas

#### Detección de imports inexistentes:

- `import/no-unresolved`: Error cuando un módulo no se puede resolver
- `import/named`: Error cuando un export nombrado no existe
- `import/default`: Error cuando un export default no existe
- `import/namespace`: Error cuando un namespace no existe
- `import/no-absolute-path`: Previene imports con rutas absolutas
- `import/no-self-import`: Previene que un archivo se importe a sí mismo
- `import/no-cycle`: Detecta dependencias circulares
- `import/no-useless-path-segments`: Limpia rutas de imports innecesarias

## Scripts disponibles

```bash
# Linting básico
pnpm run lint

# Linting + verificación de tipos (RECOMENDADO)
pnpm run lint:check

# Solo verificación de tipos
pnpm run type-check

# Formateo de código
pnpm run format
```

## Verificación de errores

La configuración actual detecta:

1. **Imports inexistentes**: TypeScript mostrará errores como:

   ```
   Cannot find module './non-existent-file' or its corresponding type declarations.
   ```

2. **Métodos inexistentes**: TypeScript validará que los métodos y propiedades existan

3. **Variables no utilizadas**: ESLint marcará variables que no se usan

4. **Problemas de React Hooks**: Validación de dependencias en hooks

## Configuración de VS Code

El archivo `.vscode/settings.json` está configurado para:

- Ejecutar ESLint automáticamente al guardar
- Organizar imports automáticamente
- Mostrar errores de TypeScript en tiempo real
- Formatear código con Prettier al guardar

## Solución de problemas

Si no ves errores de imports inexistentes:

1. Reinicia VS Code
2. Ejecuta `pnpm run type-check` para verificar manualmente
3. Verifica que el archivo `tsconfig.json` esté correctamente configurado
4. Asegúrate de que la extensión de TypeScript esté habilitada

## Ejemplo de errores detectados

```typescript
// ❌ Imports inexistentes - Ahora detectados por ESLint + TypeScript
import { ComponenteInexistente } from './archivo-que-no-existe'  // Error: Cannot resolve module
import { MetodoFaltante } from '@/components/componente-inexistente'  // Error: Module not found
import { FuncionInexistente } from 'libreria-que-no-existe'  // Error: Cannot resolve module

// ❌ Exports nombrados que no existen
import { ExportInexistente } from './archivo-real'  // Error: Export 'ExportInexistente' not found

// ❌ Variable no utilizada
const variableNoUsada = 'valor'  // Error: 'variableNoUsada' is assigned a value but never used

// ❌ Uso de any sin necesidad
const datos: any = obtenerDatos()  // Warning: Unexpected any

// ❌ Propiedades/métodos inexistentes en objetos
const obj = { nombre: 'Juan' }
console.log(obj.apellido)  // Error: Property 'apellido' does not exist

// ❌ Métodos inexistentes en arrays
const lista = [1, 2, 3]
lista.metodoInexistente()  // Error: Property 'metodoInexistente' does not exist

// ❌ Imports circulares
// archivo-a.ts: import './archivo-b'
// archivo-b.ts: import './archivo-a'  // Error: Dependency cycle detected

// ✅ Esto está bien
import { ComponenteReal } from '@/components/componente-real'
import { useState } from 'react'

const miComponente = () => {
  const [estado, setEstado] = useState('')
  return <div>{estado}</div>
}
```

## Comandos para probar la configuración

```bash
# Verificar todos los errores de linting e imports
pnpm run lint:check

# Solo verificar errores de TypeScript (imports inexistentes, tipos, etc.)
pnpm run type-check

# Solo verificar errores de ESLint
pnpm run lint
```

La configuración está optimizada para proyectos Next.js con TypeScript y detectará errores de importación y otros problemas comunes en el desarrollo.
