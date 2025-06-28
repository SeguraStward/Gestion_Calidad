# estructura de user-permission

user se compone de una vista de lista, vista visualizacion y vista de formulario
formulario y vista muestra la totalidad de informacion

## logica, almacenamiento y comunicacion con el api

se define la logica en:
"src\lib\api\modules\user-permission"

- hooks
- user-permission.store.ts (zustan)
- services
- user-permission.types.ts

para manejo general generico en:
"src\lib\api"

- hooks
- stores
- types
- base-api.service.ts

## GUI

componentes para usuario:
personalizacion de los componentes reusables o definicion de componentes nuevos para user
"src\components\models\user-management\user-permission"

componentes basicos reusables:
"src\components\base"
"src\components\styles"

paginas:
uso de componentes para formar las paginas
"src\app\user-management\user-permission"

## manejo especial en la edicion

no se puede crear nuevos y no se puede modificar el valor del campo code que corresponde al recurso
solo puede cambiar el nombre y descripccion

## Estructura lógica de organización para las páginas

- user-permission:
  - list
  - id (visualización)
    - edit (edita los datos)
