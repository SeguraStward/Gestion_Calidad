# estructura de user

user se compone de una vista de lista, vista visualizacion y vista de formulario
formulario y vista muestra la totalidad de informacion
la vista de creacion es mas basica solo requiere de cedula, nombre, email. el estado al crear se define como UserStatus.PRE_REGISTRATION

usa los types y enums de prisma. el UserStatus y Phones(campo conpuesto)

## logica, almacenamiento y comunicacion con el api

se define la logica en:
"src\lib\api\modules\user"

- hooks
- user.store.ts (zustan)
- services
- user.types.ts

para manejo general generico en:
"src\lib\api"

- hooks
- stores
- types
- base-api.service.ts

## GUI

componentes para usuario:
personalizacion de los componentes reusables o definicion de componentes nuevos para user
"src\components\models\user-management\user"

componentes basicos reusables:
"src\components\base"
"src\components\styles"

paginas:
uso de componentes para formar las paginas
src\app\user-management\user

## Estructura lógica de organización para las páginas

- user:
  - list
  - create
  - id (visualización)
    - edit (edita los datos)
