# Trabajo Práctico Integrador 1

API REST para gestionar un blog personal con autenticación, artículos y etiquetas.

## Tecnologías y estructura

- Node.js con ES Modules, Express y Sequelize.
- MySQL de XAMPP y `mysql2`.
- JWT en cookie `HttpOnly`, contraseñas con bcrypt y validaciones con `express-validator`.

```text
src/
├── app.js
├── config/          # Conexión con MySQL
├── controllers/     # Casos de uso HTTP y try/catch centralizado por controlador
├── helpers/         # JWT, bcrypt, serialización y tratamiento de controladores
├── middlewares/     # Autenticación, autorización y validaciones
├── models/          # Modelos Sequelize y asociaciones
└── routes/          # Rutas de autenticación, usuarios, etiquetas y artículos
tests/               # Pruebas automatizadas sin escrituras en MySQL
```

## Preparar XAMPP y ejecutar

1. Inicia **MySQL** desde el panel de XAMPP.
2. Crea la base `blog_personal` en phpMyAdmin si todavía no existe. No es necesario crearla otra vez si ya tienes una base equivalente.
3. Copia `.env.example` a `.env` y completa `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` y una clave privada para `JWT_SECRET`. No subas `.env` a Git.
4. Instala dependencias con `npm install`.
5. Inicia la API con `npm run dev`; la dirección predeterminada es `http://localhost:3000`.
6. Ejecuta las pruebas con `npm test`. Estas no necesitan iniciar XAMPP.

Se espera que la base tenga estas tablas, nombres de columnas y tipos compatibles con los modelos:

| Tabla | Columnas propias | Restricciones importantes |
|---|---|---|
| `users` | `id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`, `deleted_at` | username y email únicos; role `user` o `admin`; borrado lógico |
| `profiles` | `id`, `user_id`, `first_name`, `last_name`, `biography`, `avatar_url`, `birth_date`, `created_at`, `updated_at` | `user_id` único y relacionado con `users.id` |
| `articles` | `id`, `title`, `content`, `excerpt`, `status`, `user_id`, `created_at`, `updated_at`, `deleted_at` | `user_id` relacionado con `users.id`; borrado lógico |
| `tags` | `id`, `name`, `created_at`, `updated_at` | `name` único |
| `articles_tags` | `id`, `article_id`, `tag_id`, `created_at`, `updated_at` | claves foráneas hacia `articles.id` y `tags.id` |

`sequelize.sync()` crea tablas que falten, pero no altera columnas de tablas que ya existen. Si el esquema previo tiene nombres, tipos, índices o claves foráneas diferentes, compáralos en phpMyAdmin con la tabla anterior antes de probar los endpoints; no se ejecutan sincronizaciones destructivas con `force` ni `alter`.

## Variables de entorno

`.env.example` contiene los nombres de configuración. `JWT_SECRET` debe reemplazarse por un valor aleatorio largo. Para producción, configura `COOKIE_SECURE=true` y `NODE_ENV=production`; en XAMPP local usa `COOKIE_SECURE=false`. `CORS_ORIGIN` acepta un origen o una lista separada por comas; por defecto se permite `http://localhost:5173` con credenciales.

## Rutas de la API

Las respuestas de error usan JSON. Códigos principales: `201` al crear, `200` al consultar/actualizar/eliminar, `400` en validaciones, `401` sin sesión, `403` sin permisos, `404` si el recurso no existe, `409` ante duplicados, `413` si el cuerpo es demasiado grande y `500` ante errores inesperados.

| Método y ruta | Acceso | Uso |
|---|---|---|
| `POST /api/auth/register` | Público | Registrar usuario y crear su perfil en una transacción |
| `POST /api/auth/login` | Público | Iniciar sesión y emitir la cookie JWT |
| `GET /api/auth/profile` | Autenticado | Consultar usuario y perfil de la sesión |
| `PUT /api/auth/profile` | Autenticado | Actualizar el perfil propio |
| `POST /api/auth/logout` | Autenticado | Cerrar sesión y limpiar la cookie |
| `GET /api/users` | Admin | Listar usuarios con perfil y artículos |
| `GET /api/users/:id` | Admin | Consultar usuario, perfil y artículos |
| `POST /api/users` | Admin | Crear usuario y perfil |
| `PUT /api/users/:id` | Admin | Actualizar usuario y/o perfil |
| `DELETE /api/users/:id` | Admin | Eliminar usuario lógicamente |
| `GET /api/tags` | Autenticado | Listar etiquetas |
| `GET /api/tags/:id` | Admin | Consultar etiqueta y artículos asociados |
| `POST /api/tags` | Admin | Crear etiqueta |
| `PUT /api/tags/:id` | Admin | Actualizar etiqueta |
| `DELETE /api/tags/:id` | Admin | Eliminar etiqueta y sus asociaciones |
| `POST /api/articles` | Autenticado | Crear artículo propio (admin puede asignar otro autor) |
| `GET /api/articles` | Autenticado | Listar artículos publicados |
| `GET /api/articles/user` | Autenticado | Listar artículos publicados propios |
| `GET /api/articles/user/:id` | Autenticado | Consultar artículo propio por ID |
| `GET /api/articles/:id` | Autenticado | Consultar artículo publicado; archivados solo para autor/admin |
| `PUT /api/articles/:id` | Autor o admin | Actualizar artículo |
| `DELETE /api/articles/:id` | Autor o admin | Eliminar artículo lógicamente y quitar asociaciones con etiquetas |
| `POST /api/articles-tags` | Autor | Asociar una etiqueta a un artículo propio (`article_id`, `tag_id`) |
| `DELETE /api/articles-tags/:articleTagId` | Autor | Quitar una asociación de su artículo |

El registro requiere `username`, `email`, `password`, `first_name` y `last_name`. La contraseña debe tener al menos ocho caracteres, una minúscula, una mayúscula y un número. La API nunca devuelve el hash de contraseña.

### Primer administrador

El registro público siempre crea usuarios con rol `user`, para evitar que alguien se otorgue privilegios. Registra la cuenta que usarás como administradora y asígnale el rol `admin` desde phpMyAdmin (por ejemplo, actualizando únicamente la fila de esa cuenta en `users`). No guardes una contraseña en texto plano ni habilites roles administrativos en el endpoint público.

## Flujo Git solicitado

El repositorio conserva `main` como base inicial. El trabajo funcional y sus commits se realizan en `proyecto-integrador`, creada desde `develop`; `develop` parte de `main`. Al finalizar y revisar la entrega, integra primero el desarrollo en `develop` y luego `develop` en `main`, resolviendo y probando cualquier conflicto:

```bash
git switch proyecto-integrador
git status
git log --oneline

git switch develop
git merge --no-ff proyecto-integrador
git switch main
git merge --no-ff develop
```

Durante el desarrollo, registra al menos diez commits en `proyecto-integrador` con mensajes concretos que describan cada cambio. Publica las ramas en GitHub cuando la revisión local esté completa.

## Autor

Leandro Sanabria — Instituto Politécnico Formosa
