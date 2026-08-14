# Checklist de Despliegue — Transfiero

## Variables de entorno requeridas en Vercel

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL directa de Neon (no pooled) | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | Clave secreta para JWT — generar con `openssl rand -base64 32` | — |
| `AUTH_URL` | URL pública del sitio | `https://transfiero.pe` |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary | `mi-cloud` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | — |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | — |
| `ADMIN_EMAIL` | Email del primer administrador | `admin@transfiero.pe` |
| `ADMIN_PASSWORD` | Contraseña del primer administrador (mín. 12 caracteres) | — |
| `ADMIN_NOMBRE` | Nombre del administrador (opcional) | `Administrador` |

> `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` solo se usan en el seed. Pueden eliminarse de Vercel luego de ejecutarlo.

---

## Paso 1 — Base de datos con Neon

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto `transfiero`, región `us-east-1` (Virginia) o `us-west-2` (Oregon)
3. Copiar la **URL directa** desde la consola de Neon (pestaña "Connection string", modo "Direct")
   - Formato: `postgresql://user:pass@host/db?sslmode=require`
   - ⚠️ No usar la URL pooled (Transaction/Session) — el proyecto usa `PrismaPg` con conexión directa
4. Ejecutar migraciones contra la DB de Neon:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

---

## Paso 2 — Vercel

1. Importar repositorio desde GitHub en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables**, agregar todas las variables de la tabla anterior
3. En **Settings → General → Build & Development Settings**:
   - Build Command: `prisma generate && next build` ← ya está en `package.json`
   - Output Directory: `.next` (por defecto)
4. Hacer deploy inicial

---

## Paso 3 — Primer administrador (seed de producción)

Ejecutar una sola vez, con las variables de entorno de producción configuradas:

```bash
ADMIN_EMAIL="admin@transfiero.pe" \
ADMIN_PASSWORD="contraseña-segura" \
DATABASE_URL="postgresql://..." \
npm run seed:prod
```

Verificar en consola: `Administrador creado: admin@transfiero.pe`

> Si el script imprime "El usuario administrador ya existe", no hay acción requerida.

---

## Paso 4 — Dominio personalizado

1. En Vercel → Settings → Domains → agregar dominio
2. Configurar DNS según las instrucciones de Vercel (nameservers o CNAME)
3. Actualizar `AUTH_URL` en Vercel con el dominio final (ej. `https://transfiero.pe`)
4. Hacer redeploy para que la variable tome efecto

---

## Paso 5 — Prueba post-deploy

- [ ] Abrir la URL del sitio — el marketplace carga sin errores
- [ ] Registrar una cuenta nueva como COMPRADOR
- [ ] Iniciar sesión con las credenciales del ADMINISTRADOR
- [ ] Verificar acceso a `/admin` y que el dashboard muestra métricas
- [ ] Subir una imagen de prueba (publicación) — verificar que Cloudinary funciona
- [ ] Solicitar recuperación de contraseña — verificar que el link del email apunta al dominio de producción (no a localhost)
- [ ] Cerrar sesión

---

## Comandos de referencia rápida

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones en producción
npx prisma migrate deploy

# Crear administrador inicial
npm run seed:prod

# Build local (equivalente al build de Vercel)
npm run build
```
