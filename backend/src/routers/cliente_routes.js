// backend/src/routers/cliente_routes.js
import {Router} from 'express'
import { registrarClientePorAdmin, registrarClientePublico, actualizarCliente,detalleCliente, detalleclienteac, eliminarCliente, listarClientes, loginPropietario, perfilPropietario, registrarCliente } from '../controllers/cliente_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
import { listarEstilistas } from '../controllers/estilista_controller.js' // Importar la nueva función

import { actualizarPasswordCliente } from '../controllers/cliente_controller.js'
import Cliente from '../models/Cliente.js'

const router = Router()

router.post('/cliente/login',loginPropietario)
// Ruta pública para que el cliente se registre solo
router.post('/cliente/registro-publico', registrarClientePublico); // <-- Nueva ruta pública

// rutas privadas( + verificarTokenJWT), el orden si importa
router.get('/cliente/perfil',verificarTokenJWT,perfilPropietario)

// Ruta para registrar cliente - Solo estilista o administrador
router.post("/cliente/registro",verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'estilista' && req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden registrar clientes.' });
    }
    next();
}, registrarCliente)

// Ruta para listar clientes - Adaptada para roles
router.get("/clientes",verificarTokenJWT, listarClientes) // <-- Esta función ya maneja roles internamente

// Ruta para listar estilistas - Solo administrador
router.get("/estilistas", verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede listar estilistas.' });
    }
    next();
}, listarEstilistas) // <-- Usamos la función de estilista_controller

// Rutas para cliente específico
router.get("/cliente/:id",verificarTokenJWT, detalleCliente)
router.get("/clienteac/:id",verificarTokenJWT, detalleclienteac)

// Ruta para eliminar cliente - Solo estilista o administrador
router.delete("/cliente/eliminar/:id", verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'estilista' && req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden eliminar clientes.' });
    }
    next();
},eliminarCliente)





// Ruta para actualizar datos personales del cliente - Solo el cliente mismo
router.put("/cliente/actualizar/:id", verificarTokenJWT, (req, res, next) => {
    // Permitir solo al cliente autenticado actualizar su propio perfil
    
    // Si es el cliente mismo, continuar
    next();
}, actualizarCliente) // <-- Usamos la función actualizarCliente del controlador



// Ruta para actualizar contraseña del cliente - Solo el cliente mismo
router.put("/cliente/actualizarpassword/:id", verificarTokenJWT, (req, res, next) => {
    // Permitir solo al cliente autenticado actualizar su propia contraseña
    if (req.user._id.toString() !== req.params.id) { // req.user._id es el ID del usuario autenticado
        return res.status(403).json({ msg: 'Acceso denegado. Solo puedes actualizar tu propia contraseña.' });
    }
    next();
}, actualizarPasswordCliente); // <-- Usamos la nueva función


// Ruta para que el administrador registre un cliente con contraseña específica y sin correo
router.post("/cliente/registro-admin", verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede crear clientes de esta manera.' });
    }
    next();
}, registrarClientePorAdmin) // <-- Usar la nueva función



// Nueva ruta: todos los clientes activos (sin filtro de estilista)
router.get('/clientes-activos-todos', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado.' });
    }
    next();
}, async (req, res) => {
    try {
        const clientes = await Cliente.find({ estadoMascota: true })
            .select("nombrePropietario nombreMascota emailPropietario estadoMascota")
            .lean();
        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al listar clientes." });
    }
});




export default router