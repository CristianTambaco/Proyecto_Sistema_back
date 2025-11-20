// backend/src/routers/estilista_routes.js
import {Router} from 'express'
import { eliminarEstilista, actualizarPassword, actualizarPerfil,comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from '../controllers/estilista_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'

import mongoose from 'mongoose' // <-- Añade esta línea
import Estilista from '../models/Estilista.js' // <-- Añade esta línea

const router = Router()


// Ruta para registro de estilista - Solo administrador (opcional: puede ser pública si se desea)
router.post('/registro', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede registrar estilistas.' });
    }
    next();
}, registro)

// Rutas para estilista existente (login, perfil, etc.) - Pueden ser para el estilista mismo
router.get('/confirmar/:token',confirmarMail)
router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)
// ----
router.post('/login',login)
router.get('/perfil',verificarTokenJWT,perfil)

// Rutas para gestionar estilistas - Solo administrador
router.put('/estilista/:id',verificarTokenJWT, (req, res, next) => {
    
    next();
}, actualizarPerfil)

router.put('/estilista/actualizarpassword/:id',verificarTokenJWT, (req, res, next) => {
    
    next();
}, actualizarPassword)

// Eliminar (lógicamente) estilista - Solo administrador
// router.delete('/estilista/:id', verificarTokenJWT, (req, res, next) => {
//     if (req.rol !== 'administrador') {
//         return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar estilistas.' });
//     }
//     next();
// }, eliminarEstilista); // Asumiendo que tienes una función eliminarEstilista



// Nueva ruta para obtener un estilista por ID - Solo administrador o el propio estilista
router.get('/estilista/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador o el estilista propietario pueden ver este perfil.' });
    }
    next();
}, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de estilista no válido." });
        }

        const estilista = await Estilista.findById(id).select("-password -token -updatedAt -__v");
        if (!estilista) {
            return res.status(404).json({ msg: "Estilista no encontrado." });
        }

        res.status(200).json(estilista);
    } catch (error) {
        console.error("Error al obtener estilista:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener el estilista.", error: error.message });
    }
});



// Ruta para eliminar (lógicamente) un estilista - Solo administrador
router.delete('/estilista/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar estilistas.' });
    }
    next();
}, eliminarEstilista); // <-- Asegúrate de importar eliminarEstilista



export default router