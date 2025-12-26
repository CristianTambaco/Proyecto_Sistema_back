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

import Mascota from '../models/Mascota.js'; // <-- Importar el modelo

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




// NUEVA RUTA: Eliminar Físicamente una mascota - Solo el cliente propietario
router.delete('/mascotas/:id/fisico', verificarTokenJWT, async (req, res) => {
try {
const { id } = req.params;
const clienteId = req.user._id; // El ID del cliente autenticado

// Verificar que la mascota existe y pertenece al cliente
const mascota = await Mascota.findById(id);
if (!mascota) {
return res.status(404).json({ msg: "Mascota no encontrada." });
}

// Verificar que el cliente sea el dueño de la mascota
if (mascota.cliente.toString() !== clienteId.toString()) {
return res.status(403).json({ msg: "Acceso denegado. No puedes eliminar esta mascota." });
}

// Eliminar físicamente la mascota
await Mascota.findByIdAndDelete(id);

// Opcional: Eliminar la imagen de Cloudinary si existe
if (mascota.avatarID) {
await cloudinary.uploader.destroy(mascota.avatarID);
}

res.status(200).json({ msg: "Registro eliminada exitosamente" });

} catch (error) {
console.error("Error al eliminar mascota físicamente:", error);
res.status(500).json({ msg: "Error interno del servidor al eliminar la mascota.", error: error.message });
}
});



export default router;