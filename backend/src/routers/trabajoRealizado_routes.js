// backend/src/routers/trabajoRealizado_routes.js
import { Router } from 'express';
import { registrarTrabajo, listarTrabajos, eliminarTrabajo } from '../controllers/trabajoRealizado_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Registrar trabajo — solo estilista o administrador
router.post('/trabajo-realizado/registro', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: "Acceso denegado. Solo estilistas y administradores pueden registrar trabajos." });
  }
  next();
}, registrarTrabajo);

// Listar trabajos — estilista (los suyos), admin (todos)
router.get('/trabajos-realizados', verificarTokenJWT, listarTrabajos);

// Eliminar (lógicamente) — solo estilista dueño o admin
router.delete('/trabajo-realizado/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: "Acceso denegado." });
  }
  next();
}, eliminarTrabajo);

export default router;