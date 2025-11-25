// backend/src/routers/servicio_routes.js
import { Router } from 'express';
import {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio // Lógica de borrado
  // borrarServicioFisicamente // Opcional
} from '../controllers/servicio_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

import Servicio from '../models/Servicio.js';



const router = Router();

// Ruta para crear un nuevo servicio - Solo administrador
router.post('/servicio', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede crear servicios.' });
  }
  next(); // Si es admin, continúa
}, crearServicio);

// Ruta para listar todos los servicios (activos) - Ahora también accesible por cliente
router.get('/servicios', verificarTokenJWT, (req, res, next) => {
  // Permitir acceso al cliente y al administrador
  if (req.user.rol !== 'administrador' && req.user.rol !== 'cliente' && req.user.rol !== 'estilista') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes y administradores pueden listar servicios.' });
  }
  next();
}, listarServicios);

// Ruta para obtener un servicio específico - Solo administrador
router.get('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede ver un servicio.' });
  }
  next(); // Si es admin, continúa
}, obtenerServicio);

// Ruta para actualizar un servicio - Solo administrador
router.put('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede actualizar servicios.' });
  }
  next(); // Si es admin, continúa
}, actualizarServicio);

// Ruta para eliminar (lógicamente) un servicio - Solo administrador
router.delete('/servicio/:id', verificarTokenJWT, (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede eliminar servicios.' });
  }
  next(); // Si es admin, continúa
}, eliminarServicio);

// Ruta para borrar físicamente un servicio - Solo administrador (Opcional)
// router.delete('/servicio/:id/fisico', verificarTokenJWT, (req, res, next) => {
//   if (req.user.rol !== 'administrador') {
//     return res.status(403).json({ msg: 'Acceso denegado. Solo el administrador puede borrar servicios físicamente.' });
//   }
//   next(); // Si es admin, continúa
// }, borrarServicioFisicamente);



// Ruta pública: listar servicios activos sin autenticación
// router.get('/servicios-publicos', async (req, res) => {
//   try {
//     const servicios = await Servicio.find({ estado: true })
//       .select('nombre descripcion precio duracionEstimada')
//       .sort({ nombre: 1 });
//     res.status(200).json(servicios);
//   } catch (error) {
//     console.error("Error al listar servicios públicos:", error);
//     res.status(500).json({ msg: "Error al cargar los servicios." });
//   }
// });




// nueva ruta:
router.get('/servicios-publicos', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query; // Por defecto, página 1, 6 servicios por página
    const skip = (page - 1) * limit;

    const servicios = await Servicio.find({ estado: true })
      .select('nombre descripcion precio duracionEstimada')
      .sort({ nombre: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Servicio.countDocuments({ estado: true });

    res.status(200).json({
      servicios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al listar servicios públicos:", error);
    res.status(500).json({ msg: "Error al cargar los servicios." });
  }
});




export default router;