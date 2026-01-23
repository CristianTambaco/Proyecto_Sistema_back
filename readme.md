# 🐾 Backend – Sistema de Gestión Estética Canina

Backend desarrollado en **Node.js + Express + MongoDB** para la gestión integral de una **estética/peluquería canina**. El sistema maneja usuarios con distintos roles, clientes, mascotas, citas, atenciones y horarios.

---

## 🚀 Tecnologías utilizadas

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT (JSON Web Token)** – Autenticación
- **BcryptJS** – Encriptación de contraseñas
- **Cloudinary** – Gestión de imágenes
- **Nodemailer** – Envío de correos
- **Express-fileupload** – Subida de archivos

---

## 📂 Estructura del proyecto

```
backend/
│── package.json
│── .env.example
└── src/
    │── index.js          # Punto de entrada
    │── server.js         # Configuración de Express
    │── database.js       # Conexión a MongoDB
    │
    ├── config/
    │   └── nodemailer.js # Configuración de correos
    │
    ├── controllers/      # Lógica de negocio
    │   ├── administrador_controller.js
    │   ├── cliente_controller.js
    │   ├── estilista_controller.js
    │   ├── mascota_controller.js
    │   ├── cita_controller.js
    │   ├── atencion_controller.js
    │   ├── horario_controller.js
    │   ├── servicio_controller.js
    │   └── trabajoRealizado_controller.js
    │
    ├── models/           # Modelos de Mongoose
    │   ├── Administrador.js
    │   ├── Cliente.js
    │   ├── Estilista.js
    │   ├── Mascota.js
    │   ├── Cita.js
    │   ├── Atencion.js
    │   ├── Horario.js
    │   ├── Servicio.js
    │   └── TrabajoRealizado.js
    │
    ├── middlewares/
    │   └── JWT.js        # Protección de rutas
    │
    └── routers/          # Definición de endpoints
        ├── administrador_routes.js
        ├── cliente_routes.js
        ├── estilista_routes.js
        ├── mascota_routes.js
        ├── cita_routes.js
        ├── atencion_routes.js
        ├── horario_routes.js
        ├── servicio_routes.js
        └── trabajoRealizado_routes.js
```

---

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd backend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3000
MONGODB_URI_LOCAL=mongodb+srv://usuario:password@cluster.mongodb.net/db

JWT_SECRET=tu_secreto

HOST_MAILTRAP=
PORT_MAILTRAP=
USER_MAILTRAP=correo@gmail.com
PASS_MAILTRAP=contraseña_app

URL_BACKEND=http://localhost:3000/
URL_FRONTEND=http://localhost:5173/

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_PRIVATE_KEY=
```

### 4️⃣ Ejecutar el proyecto

Modo desarrollo:
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

---

## 🔐 Autenticación y roles

El sistema maneja **JWT** y control de acceso por roles:

- **Administrador**
- **Estilista**
- **Cliente**

Las rutas están protegidas mediante middleware y validación de rol.

---

## ✉️ Correos electrónicos

Configurado con **Nodemailer + Gmail**.

---

## ⏰ Horarios y reservas

- Gestión de horarios por día
- Validación automática de citas
- Evita reservas fuera del horario o en fechas pasadas


---

## 📌 Endpoints base

```
GET    /api/
POST   /api/login
POST   /api/administrador
POST   /api/clientes
POST   /api/atenciones
```

---

## 🧪 Buenas prácticas implementadas

- Validaciones de datos
- Encriptación de contraseñas
- Eliminación lógica
- Separación por capas (MVC)
- Variables de entorno

---

## 📄 Licencia

Proyecto académico / educativo.

---



