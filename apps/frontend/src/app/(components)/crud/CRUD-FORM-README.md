# CRUD Form

Un componente reutilizable para la creación de formularios estandarizados en aplicaciones CRUD.

## Características

- Estructura consistente para todos los formularios
- Soporte para diferentes tipos de campos
- Organización por secciones
- Integración con React Hook Form
- Diseño responsivo
- Compatible con el sistema de diseño de UNA-GC
- Adaptador para integración con CrudModuleBase

## Componentes

Este módulo incluye los siguientes componentes:

1. **CrudForm**: Componente base para crear formularios estructurados
2. **CrudFormAdapter**: Adaptador para conectar CrudForm con CrudModuleBase
3. **Ejemplos**: Implementaciones de referencia

## Uso Básico

### CrudForm

```tsx
import { CrudForm, FormSection } from '@/app/(components)/crud/crud-form'
import { useForm } from 'react-hook-form'

// Definir el tipo de datos del formulario
interface UserData {
  name: string
  email: string
  role: string
}

// En tu componente:
const formMethods = useForm<UserData>({
  defaultValues: {
    name: '',
    email: '',
    role: ''
  }
})

// Definir las secciones del formulario
const sections: FormSection<UserData>[] = [
  {
    title: 'Información Básica',
    fields: [
      {
        type: 'text',
        name: 'name',
        label: 'Nombre',
        required: true
      },
      {
        type: 'email',
        name: 'email',
        label: 'Email',
        required: true
      },
      {
        type: 'select',
        name: 'role',
        label: 'Rol',
        options: [
          { id: 'admin', name: 'Administrador' },
          { id: 'user', name: 'Usuario' }
        ]
      }
    ]
  }
]

// Renderizar el formulario
return (
  <CrudForm
    formMethods={formMethods}
    sections={sections}
    onSubmit={handleSubmit}
    onCancel={handleCancel}
    isSubmitting={isSubmitting}
    title="Crear Usuario"
  />
)
```

### Integración con CrudModuleBase

Para usar CrudForm con CrudModuleBase, utiliza el adaptador:

```tsx
// En la configuración de tu CRUD:
const crudConfig = {
  // ... otras configuraciones
  renderForm: (props) => {
    const getSections = ({ control, errors, editingItem, isUpdate }) => [
      {
        title: 'Información Básica',
        fields: [
          {
            type: 'text',
            name: 'name',
            label: 'Nombre',
            required: true
          },
          // ... más campos
        ]
      }
    ]
    
    return (
      <CrudFormAdapter
        {...props}
        title={props.isUpdate ? 'Editar' : 'Crear'}
        sections={getSections}
      />
    )
  }
}
```

## Tipos de Campos Soportados

### Text

```tsx
{
  type: 'text',
  name: 'name',
  label: 'Nombre',
  required: true,
  placeholder: 'Ingrese su nombre'
}
```

### Number

```tsx
{
  type: 'number',
  name: 'age',
  label: 'Edad',
  min: 18,
  max: 100
}
```

### Email

```tsx
{
  type: 'email',
  name: 'email',
  label: 'Correo electrónico'
}
```

### Select

```tsx
{
  type: 'select',
  name: 'country',
  label: 'País',
  options: [
    { id: 'cr', name: 'Costa Rica' },
    { id: 'us', name: 'Estados Unidos' }
  ]
}
```

### Date

```tsx
{
  type: 'date',
  name: 'birthdate',
  label: 'Fecha de nacimiento'
}
```

### Custom

```tsx
{
  type: 'custom',
  name: 'terms',
  label: 'Términos',
  render: ({ field, formState, disabled }) => (
    <div>
      <input
        type="checkbox"
        checked={field.value}
        onChange={(e) => field.onChange(e.target.checked)}
        disabled={disabled}
      />
      <label>Acepto los términos y condiciones</label>
    </div>
  )
}
```

## Estructura del Formulario

Los formularios se organizan en secciones, cada una con su título y campos:

```tsx
const sections = [
  {
    title: 'Sección 1',
    description: 'Descripción opcional',
    fields: [/* campos */]
  },
  {
    title: 'Sección 2',
    fields: [/* campos */]
  }
]
```

## Ejemplos

Para ver ejemplos completos, consulta:

1. `crud-form-example.tsx`: Ejemplo básico de uso de CrudForm
2. `crud-integration-example.tsx`: Ejemplo de integración completa con CrudModuleBase

## Consideraciones

- Todos los campos requieren un `name` que corresponda a una propiedad en tu objeto de datos
- Los campos obligatorios deben tener `required: true`
- Para tipos especiales como fechas o arrays, usa campos personalizados (`type: 'custom'`)
- El adaptador maneja automáticamente la comunicación con CrudModuleBase
