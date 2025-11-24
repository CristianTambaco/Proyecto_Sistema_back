// backend/src/routers/servicio_routes.js
import { Router } from 'express';
import {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio // Lógica de borrado
  // borrarServicioFisicamente // Opcional
} from '../controllers/servicio_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Ruta para crear un nuevo servicio - Solo administrador
router.post('/servicio', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede crear servicios.' });
  }
  next(); // Si es admin, continúa
}, crearServicio);

// Ruta para listar todos los servicios (activos) - Ahora también accesible por cliente
router.get('/servicios', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente y al administrador
  if (req.user.rol !== 'administrador' && req.user.rol !== 'cliente' && req.user.rol !== 'estilista') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes y administradores pueden listar servicios.' });
  }
  next();
}, listarServicios);

// Ruta para obtener un servicio específico - Solo administrador
router.get('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede ver un servicio.' });
  }
  next(); // Si es admin, continúa
}, obtenerServicio);

// Ruta para actualizar un servicio - Solo administrador
router.put('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede actualizar servicios.' });
  }
  next(); // Si es admin, continúa
}, actualizarServicio);

// Ruta para eliminar (lógicamente) un servicio - Solo administrador
router.delete('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar servicios.' });
  }
  next(); // Si es admin, continúa
}, eliminarServicio);

// Ruta para borrar físicamente un servicio - Solo administrador (Opcional)
// router.delete('/servicio/:id/fisico', verificarTokenJWT, (req, res, next) => {
//   if (req.user.rol !== 'administrador') {
//     return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede borrar servicios físicamente.' });
//   }
//   next(); // Si es admin, continúa
// }, borrarServicioFisicamente);

export default router;