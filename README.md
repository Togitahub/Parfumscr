# Parfumsoft 🌸

**Plataforma multi-tienda de perfumería con catálogo, pedidos por WhatsApp y panel de administración.**

---

## Descripción

Parfumsoft es una plataforma SaaS que permite a distribuidores de perfumes crear su propia tienda online personalizada. Cada vendedor (ADMIN) obtiene un subdominio o dominio propio, configura sus colores, logo y catálogo, y recibe pedidos directamente por WhatsApp. El sistema es multi-tenant: un único backend sirve a múltiples tiendas independientes.

---

## Stack tecnológico

### Frontend

- **React 18** + **Vite**
- **Tailwind CSS v4** — sistema de diseño con variables CSS dinámicas por tienda
- **Apollo Client** — comunicación GraphQL con caché en memoria
- **React Router v6** — enrutamiento SPA con rutas protegidas por rol

### Backend

- **Node.js** + **Express**
- **Apollo Server 4** — API GraphQL
- **Mongoose** — ODM para MongoDB
- **JWT** — autenticación stateless
- **Cloudinary** — almacenamiento y firma de imágenes
- **Nodemailer** — envío de correos (recuperación de contraseña)

---

## Arquitectura

```
client/
├── components/       # UI reutilizable (cards, forms, common, design)
├── graphql/          # Queries y mutations por entidad
├── hooks/            # Contextos: Auth, Store, Filter, Theme, Toast
├── lists/            # Listas con búsqueda y paginación (Product, User, Order)
├── views/            # Páginas de la aplicación
└── routes/           # ProtectedRoute, ScrollToTop

server/
├── config/           # Apollo, MongoDB, Cloudinary, Nodemailer, createAdmin
├── graphql/
│   ├── defs/         # TypeDefs por entidad
│   └── resolvers/    # Resolvers por entidad
└── models/           # Modelos Mongoose
```

---

## Multi-tenancy

La plataforma detecta la tienda activa por **subdominio** o **dominio personalizado** en cada request. El `StoreContext` carga la configuración de colores, logo y WhatsApp al inicio y aplica las variables CSS dinámicamente. Si no se encuentra una tienda activa, se renderiza la landing con los planes disponibles.

**Flujo de detección:**

1. Se lee `window.location.hostname`
2. Se consulta `/api/store-config?slug=<subdominio>`
3. El servidor busca por `customDomain` → `slug` → subdominio
4. Los colores se inyectan como CSS variables en `:root`

---

## Roles de usuario

| Rol           | Permisos                                                          |
| ------------- | ----------------------------------------------------------------- |
| `COSTUMER`    | Navegar catálogo, favoritos, carrito, órdenes                     |
| `ADMIN`       | Todo lo anterior + gestión de productos, tienda y catálogo propio |
| `SUPER_ADMIN` | Acceso total: usuarios, todas las entidades del sistema           |

---

## Entidades principales

- **Product** — Perfume o decant. Los decants heredan marca, categoría, segmento e imágenes del perfume padre (`linkedProduct`).
- **Store** — Tienda de un ADMIN. Tiene slug, dominio, colores, WhatsApp y logo.
- **StoreProduct** — Relación tienda ↔ producto. Permite precio y stock por tienda.
- **Brand / Category / Segment / Note** — Taxonomías del catálogo.
- **Cart / Favorites / Order** — Flujo de compra del consumidor.

---

## Variables de entorno

### Server (`server/.env`)

```env
MONGO_URI=
JWT_SECRET=
SERVER_PORT=4000

SUPER_ADMIN_NAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=

CLOUD_NAME=
CLOUD_KEY=
CLOUD_SECRET=

EMAIL_USER=
EMAIL_PASSWORD=
```

### Client (`client/.env`)

```env
VITE_SERVER_URI=http://localhost:4000/graphql
VITE_STORE_SLUG=default          # slug usado en localhost
VITE_SUPER_ADMIN_WS=50600000000  # WhatsApp del super admin (landing)
```

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <repo-url>

# 2. Instalar dependencias del servidor
cd server && npm install

# 3. Instalar dependencias del cliente
cd ../client && npm install

# 4. Configurar variables de entorno (ver sección anterior)

# 5. Arrancar el servidor
cd server && npm run dev

# 6. Arrancar el cliente
cd client && npm run dev
```

El servidor corre en `http://localhost:4000` (GraphQL en `/graphql`).
El cliente corre en `http://localhost:5173`.

Al conectar por primera vez, si no existe ningún usuario, se crea automáticamente el Super Admin con las credenciales del `.env`.

---

## Flujo de compra

1. El cliente navega el catálogo de la tienda (`/store`)
2. Agrega productos al carrito
3. En `/store/cart` confirma el pedido con nombre, teléfono y dirección
4. Se crea la orden en BD con estado `SOLICITADO_WS`
5. Se abre WhatsApp con el mensaje prearmado listo para enviar al vendedor

---

## Imágenes (Cloudinary)

Las imágenes se suben desde el cliente directamente a Cloudinary usando firma del servidor:

1. El cliente solicita una firma a `/api/cloudinary-signature`
2. El servidor genera la firma con `api_sign_request`
3. El cliente sube la imagen a la API de Cloudinary con esa firma
4. La URL resultante se guarda en el producto

Para eliminar imágenes se usa `/api/cloudinary-delete`.

---

## Recuperación de contraseña

1. El usuario solicita un código por email (`requestPasswordReset`)
2. Se genera un token aleatorio, se hashea con SHA-256 y se guarda en el usuario con expiración de 1 hora
3. Se envía el token original por email vía Nodemailer
4. El usuario ingresa el token y su nueva contraseña (`resetPassword`)

---

## Consideraciones de seguridad

- Las contraseñas se hashean con **bcrypt** (12 rounds en registro, 10 en reset)
- Los tokens JWT expiran en **2 horas**; el cliente verifica la expiración cada 5 minutos
- El contexto de Apollo extrae el JWT del header `Authorization: Bearer <token>` en cada request
- Los resolvers validan rol y propiedad antes de cualquier operación sensible

---

## Licencia

MIT
