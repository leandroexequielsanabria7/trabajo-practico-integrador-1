# trabajo-practico-integrador-1

Sistema de Gestión de Blog Personal con Autenticación (Express + Sequelize + MySQL).

## Requisitos
- Node.js 18 o superior
- MySQL (XAMPP) con una base de datos llamada `blog_db`

## Instalación
```bash
npm install
cp .env.example .env   # completar los valores
npm run dev
```

## Endpoints principales
- `/api/auth` → register, login, profile, logout
- `/api/users` → CRUD (solo admin)
- `/api/tags` → CRUD (admin; listar: autenticado)
- `/api/articles` → CRUD (autor o admin)
- `/api/articles-tags` → asociar etiquetas (solo autor)

## Ramas
- `main` → versión entregada
- `develop` → integración
- `proyecto-integrador` → desarrollo