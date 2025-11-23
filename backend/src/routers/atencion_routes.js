// backend/src/routers/atencion_routes.js
import {Router} from 'express'
import { eliminarAtencion, pagarAtencion, registrarAtencion } from '../controllers/atencion_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'

import { listarTodasAtenciones } from '../controllers/atencion_controller.js';

const router = Router()

// Ruta para registrar una atención (reserva de servicio) - Ahora también accesible por cliente
router.post('/atencion/registro', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente, estilista y administrador
  if (req.user.rol !== 'cliente' && req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes, estilistas y administradores pueden registrar atenciones.' });
  }
  next(); // Si es cliente, estilista o admin, continúa
}, registrarAtencion)

// Ruta para eliminar atención - Solo estilista o administrador
router.delete('/atencion/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden eliminar atenciones.' });
  }
  next();
}, eliminarAtencion)

// Ruta para pagar atención - Solo cliente (o estilista/admin si pagan por el cliente)
router.post('/atencion/pago', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente, estilista y administrador
  if (req.user.rol !== 'cliente' && req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes, estilistas y administradores pueden realizar pagos.' });
  }
  next();
}, pagarAtencion)



// Nueva ruta: listar todas las atenciones (solo estilista o administrador)
router.get('/atenciones-todas', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden ver este historial.' });
    }
    next();
}, listarTodasAtenciones);



export default router