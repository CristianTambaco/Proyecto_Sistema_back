// backend/src/routers/administrador_routes.js
import {Router} from 'express'
import { eliminarAdministrador, actualizarPassword, actualizarPerfil,comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from '../controllers/administrador_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'

import mongoose from 'mongoose' // <-- Añade esta línea
import Administrador from '../models/Administrador.js' // <-- Añade esta línea

const router = Router()


router.post('/registroad',registro)


router.get('/confirmar/:token',confirmarMail)


router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)


// ----
router.post('/loginad',login)


router.get('/perfil',verificarTokenJWT,perfil)

router.put('/administrador/:id',verificarTokenJWT,actualizarPerfil)

router.put('/administrador/actualizarpassword/:id',verificarTokenJWT,actualizarPassword)



// Nueva ruta para obtener un administrador por ID - Solo administrador o el propio administrador
router.get('/administrador/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador o el administrador propietario pueden ver este perfil.' });
    }
    next();
}, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de administrador no válido." });
        }

        const administrador = await Administrador.findById(id).select("-password -token -updatedAt -__v");
        if (!administrador) {
            return res.status(404).json({ msg: "Administrador no encontrado." });
        }

        res.status(200).json(administrador);
    } catch (error) {
        console.error("Error al obtener administrador:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener el administrador.", error: error.message });
    }
});


// Ruta para eliminar (lógicamente) un administrador - Solo administrador
router.delete('/administrador/:id', verificarTokenJWT, (req, res, next) => {
    if (req.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar administradores.' });
    }
    next();
}, eliminarAdministrador); // <-- Asegúrate de importar eliminarAdministrador


export default router

