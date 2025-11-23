import { Router } from 'express';
import { listarCitas } from '../controllers/cita_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Solo estilista y administrador pueden ver todas las citas
router.get('/citas', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden ver las citas.' });
    }
    next();
}, listarCitas);

export default router;