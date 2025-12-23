// requerir módulos 
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerEstilistas from './routers/estilista_routes.js'
import routerClientes from './routers/cliente_routes.js'

import routerAdministradors from './routers/administrador_routes.js'


import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"


import routerAtencions from './routers/atencion_routes.js'

import routerHorarios from './routers/horario_routes.js' // Añadir este import


import routerServicios from './routers/servicio_routes.js' // Añadir este import

import routerAdminUsuarios from './routers/administrador_usuario_routes.js' // Añadir import


import routerCitas from './routers/cita_routes.js';


import routerTrabajoRealizado from './routers/trabajoRealizado_routes.js';



import routerMascotas from './routers/mascota_routes.js'; // <-- Añadir esta línea





//  Incializaciones 
const app = express()
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}));





// Configuraciones
app.set('port', process.env.PORT || 3000)
app.use(cors())

// Middleware
app.use(express.json())


// Rutas
app.get('/',(req,res)=>{
    res.send("Sever on")
})

// Rutas para estilistas
app.use('/api',routerEstilistas)


// Rutas para administrador
app.use('/api',routerAdministradors)


//Rutas para clientes
app.use('/api',routerClientes)


// Rutas para atencions
app.use('/api',routerAtencions)


// Rutas para horarios - 
app.use('/api', routerHorarios) // Asegúrate de que todas las rutas api usen el prefijo '/api'

// Rutas para servicios - 
app.use('/api', routerServicios) // Asegúrate de que todas las rutas api usen el prefijo '/api'

// Rutas para gestionar usuarios (admin y estilista)
app.use('/api', routerAdminUsuarios) // Añadir esta línea


app.use('/api', routerCitas);


app.use('/api', routerTrabajoRealizado);


app.use('/api', routerMascotas); // <-- rutas



// Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})





// Exportar la instancia de express
export default app





