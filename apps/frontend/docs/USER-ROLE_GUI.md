# estructura de user-role

user se compone de una vista de lista, vista visualizacion y vista de formulario
formulario y vista muestra la totalidad de informacion
contiene el campo compesto de permisos. tiene las varios campos contenidos. incluido uno referencia a la entidad de user-permission

## logica, almacenamiento y comunicacion con el api

se define la logica en:
"src\lib\api\modules\user-role"

- hooks
- user-role.store.ts (zustan)
- services
- user-role.types.ts

para manejo general generico en:
"src\lib\api"

- hooks
- stores
- types
- base-api.service.ts

## GUI

componentes para usuario:
personalizacion de los componentes reusables o definicion de componentes nuevos para user
"src\components\models\user-management\user-role"

componentes basicos reusables:
"src\components\base"
"src\components\styles"

paginas:
uso de componentes para formar las paginas
"src\app\user-management\user-role"

## manejo especial en la edicion y creacion

el campo de edicion permite modificar campos normales y la gestion de persmisos del rol
tiene que cargar los permisos existentes para asignarlos y poder ver el nombre del permisos
los permisos no se deben duplicar para un rol
se le asgina un array con los tipos de permisos y otro que es el scope

## Estructura lógica de organización para las páginas

- user-role:
  - list
  - create
  - id (visualización)
    - edit (edita los datos)
