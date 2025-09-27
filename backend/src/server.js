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


// Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})





// Exportar la instancia de express
export default app





