// backend/src/routers/mascota_routes.js
import { Router } from 'express';
import {
    crearMascota,
    listarMascotas,
    obtenerMascota,
    actualizarMascota,
    eliminarMascota
} from '../controllers/mascota_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Solo el cliente autenticado puede acceder a estas rutas
router.post('/mascotas', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo clientes pueden gestionar mascotas.' });
    }
    next();
}, crearMascota);

router.get('/mascotas', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo clientes pueden ver sus mascotas.' });
    }
    next();
}, listarMascotas);

router.get('/mascotas/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo clientes pueden ver sus mascotas.' });
    }
    next();
}, obtenerMascota);

router.put('/mascotas/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo clientes pueden actualizar sus mascotas.' });
    }
    next();
}, actualizarMascota);

router.delete('/mascotas/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo clientes pueden eliminar sus mascotas.' });
    }
    next();
}, eliminarMascota);

export default router;