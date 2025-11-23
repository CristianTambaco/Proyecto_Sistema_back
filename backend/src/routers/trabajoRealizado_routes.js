// backend/src/routers/trabajoRealizado_routes.js
import { Router } from 'express';
import { registrarTrabajo, listarTrabajos } from '../controllers/trabajoRealizado_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Solo estilista y administrador pueden registrar
router.post('/trabajo-realizado/registro', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: "Acceso denegado. Solo estilistas y administradores pueden registrar trabajos." });
    }
    next();
}, registrarTrabajo);

// Listar trabajos (estilista: los suyos, admin: todos)
router.get('/trabajos-realizados', verificarTokenJWT, listarTrabajos);

export default router;