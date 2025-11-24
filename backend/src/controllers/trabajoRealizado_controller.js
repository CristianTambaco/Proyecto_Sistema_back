// backend/src/controllers/trabajoRealizado_controller.js
import TrabajoRealizado from '../models/TrabajoRealizado.js';
import mongoose from 'mongoose';

// Registrar un trabajo realizado (solo estilista o admin)
export const registrarTrabajo = async (req, res) => {
  const { cliente, nombreServicio, descripcion, prioridad, precio, observaciones } = req.body;

  if (!mongoose.Types.ObjectId.isValid(cliente)) {
    return res.status(400).json({ msg: "ID de cliente inválido" });
  }

  try {
    const nuevoTrabajo = new TrabajoRealizado({
      cliente,
      estilista: req.user._id,
      nombreServicio,
      descripcion,
      prioridad,
      precio,
      observaciones
    });

    await nuevoTrabajo.save();
    res.status(201).json({ msg: "Trabajo registrado correctamente", trabajo: nuevoTrabajo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar el trabajo" });
  }
};

// Listar trabajos (estilista: los suyos, admin: todos, solo activos)
export const listarTrabajos = async (req, res) => {
  try {
    let query = { activo: true };
    if (req.user.rol === 'estilista') {
      query.estilista = req.user._id;
    }
    // Si es admin, no se añade filtro adicional → verá todos los activos

    const trabajos = await TrabajoRealizado.find(query)
      .populate('cliente', 'nombrePropietario nombreMascota emailPropietario')
      .populate('estilista', 'nombre apellido')
      .sort({ fechaRealizacion: -1 });

    res.status(200).json(trabajos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al listar trabajos" });
  }
};

// Eliminar (lógicamente) un trabajo
export const eliminarTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de trabajo no válido." });
    }

    const trabajo = await TrabajoRealizado.findById(id);
    if (!trabajo) {
      return res.status(404).json({ msg: "Trabajo no encontrado." });
    }

    // Solo el estilista que lo registró o un administrador pueden eliminarlo
    if (req.user.rol !== 'administrador' && trabajo.estilista.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Acceso denegado." });
    }

    trabajo.activo = false;
    await trabajo.save();

    res.status(200).json({ msg: "Trabajo eliminado del historial." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar el trabajo." });
  }
};