// backend/src/routers/administrador_usuario_routes.js
import { Router } from 'express';
import { registro, actualizarPerfil, actualizarPassword, listarAdministradores } from '../controllers/administrador_controller.js'; // Importar funciones relevantes
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Listar administradores - Solo administrador
router.get('/administradores', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede listar administradores.' });
    }
    next();
}, listarAdministradores);

// Crear administrador - Solo administrador
router.post('/administrador', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede crear administradores.' });
    }
    next();
}, registro); // Reutilizamos la función de registro, asumiendo que puede manejar rol 'administrador'

// Actualizar perfil de administrador - Solo administrador (puede ser él mismo o otro)
router.put('/administrador/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede actualizar perfiles de administradores.' });
    }
    next();
}, actualizarPerfil);

// Actualizar contraseña de administrador - Solo administrador (puede ser él mismo o otro)
router.put('/administrador/actualizarpassword/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede actualizar contraseñas de administradores.' });
    }
    next();
}, actualizarPassword);

// Eliminar (lógicamente) administrador - Solo administrador
// router.delete('/administrador/:id', verificarTokenJWT, (req, res, next) => {
//     if (req.rol !== 'administrador') {
//         return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar administradores.' });
//     }
//     next();
// }, eliminarAdministrador); // Asumiendo que tienes una función eliminarAdministrador

export default router;