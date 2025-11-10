// backend/src/routers/cliente_routes.js
import {Router} from 'express'
import { registrarClientePublico, actualizarCliente,detalleCliente, detalleclienteac, eliminarCliente, listarClientes, loginPropietario, perfilPropietario, registrarCliente } from '../controllers/cliente_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
import { listarEstilistas } from '../controllers/estilista_controller.js' // Importar la nueva función



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

// Ruta para actualizar cliente - Solo estilista o administrador
router.put("/cliente/actualizar/:id", verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'estilista' && req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden actualizar clientes.' });
    }
    next();
},actualizarCliente)

export default router