// backend/src/routers/atencion_routes.js
import {Router} from 'express'
import { eliminarAtencion, pagarAtencion, registrarAtencion, actualizarAtencion, actualizarEstadoAtencion } from '../controllers/atencion_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'

import { listarTodasAtenciones } from '../controllers/atencion_controller.js';

import mongoose from 'mongoose'; // <-- 
import Atencion from '../models/Atencion.js';



const router = Router()

// Ruta para registrar una atención (reserva de servicio) - Ahora también accesible por cliente
router.post('/atencion/registro', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente, estilista y administrador
  if (req.user.rol !== 'cliente' && req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes, estilistas y administradores pueden registrar atenciones.' });
  }
  next(); // Si es cliente, estilista o admin, continúa
}, registrarAtencion)


// Ruta para eliminar atención - Solo estilista, administrador o el cliente propietario de la atención
router.delete('/atencion/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador' && req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas, administradores o el cliente propietario pueden eliminar atenciones.' });
    }
    next();
}, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de atención inválido." });
    }

    // Si el rol es 'cliente', verificar que la atención pertenece al cliente
    if (req.user.rol === 'cliente') {
        const atencion = await Atencion.findById(id);
        if (!atencion || atencion.cliente.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Acceso denegado. No puedes eliminar una reserva que no es tuya.' });
        }
    }

    await Atencion.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Registro eliminado exitosamente" });
});

// Ruta para pagar atención - Solo cliente (o estilista/admin si pagan por el cliente)
router.post('/atencion/pago', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente, estilista y administrador
  if (req.user.rol !== 'cliente' && req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes, estilistas y administradores pueden realizar pagos.' });
  }
  next();
}, pagarAtencion)



// Nueva ruta: listar todas las atenciones (solo estilista o administrador)
router.get('/atenciones-todas', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden ver este historial.' });
    }
    next();
}, listarTodasAtenciones);




// Ruta para obtener una atención específica por ID - Solo estilista o administrador
router.get('/atencion/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador' && req.user.rol !== 'cliente') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden ver detalles.' });
    }
    next();
}, async (req, res) => {
    try {
        const { id } = req.params;
        // Validar que el ID sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de atención inválido." });
        }
        // Obtener la atención y poblar los datos del cliente
        const atencion = await Atencion.findById(id)
            .populate('cliente', 'nombrePropietario nombreMascota emailPropietario');
        if (!atencion) {
            return res.status(404).json({ msg: "Atención no encontrada." });
        }
        res.status(200).json(atencion);
    } catch (error) {
        console.error("Error al obtener atención:", error);
        res.status(500).json({ msg: "Error interno del servidor." });
    }
});





// NUEVA RUTA: Actualizar una atención - Solo cliente (para sus propias atenciones), estilista o administrador
router.put('/atencion/:id', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente, estilista y administrador
  if (req.user.rol !== 'cliente' && req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes, estilistas y administradores pueden editar atenciones.' });
  }
  next();
}, actualizarAtencion); // <-- Importante: asegúrate de importar 'actualizarAtencion'





// Ruta para actualizar el estado de una atención - Solo estilista o administrador
router.put('/atencion/estado/:id', verificarTokenJWT, (req, res, next) => {
    if (req.user.rol !== 'estilista' && req.user.rol !== 'administrador') {
        return res.status(403).json({ msg: 'Acceso denegado. Solo estilistas y administradores pueden actualizar el estado.' });
    }
    next();
}, actualizarEstadoAtencion); // <-- Usar la nueva función




export default router