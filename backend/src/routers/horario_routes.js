// backend/src/routers/horario_routes.js
import { Router } from 'express';
import {
  crearHorario,
  listarHorarios,
  obtenerHorario,
  actualizarHorario,
  eliminarHorario
} from '../controllers/horario_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Ruta para crear un nuevo horario - Solo administrador
router.post('/horario', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede crear horarios.' });
  }
  next(); // Si es admin, continúa
}, crearHorario);

// Ruta para listar todos los horarios - Solo administrador
router.get('/horarios', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede listar horarios.' });
  }
  next(); // Si es admin, continúa
}, listarHorarios);

// Ruta para obtener un horario específico - Solo administrador
router.get('/horario/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede ver un horario.' });
  }
  next(); // Si es admin, continúa
}, obtenerHorario);

// Ruta para actualizar un horario - Solo administrador
router.put('/horario/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede actualizar horarios.' });
  }
  next(); // Si es admin, continúa
}, actualizarHorario);

// Ruta para eliminar un horario - Solo administrador
router.delete('/horario/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar horarios.' });
  }
  next(); // Si es admin, continúa
}, eliminarHorario);

export default router;