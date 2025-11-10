// backend/src/controllers/horario_controller.js
import Horario from '../models/Horario.js';
import mongoose from 'mongoose';

// Registrar un nuevo horario
const crearHorario = async (req, res) => {
  try {
    const { dia, horaApertura, horaCierre, estado } = req.body;

    // Validaciones básicas (puedes expandirlas)
    if (!dia || !horaApertura || !horaCierre) {
      return res.status(400).json({ msg: "Los campos día, hora de apertura y hora de cierre son obligatorios." });
    }

    // Validar que la hora de cierre sea posterior a la de apertura
    if (horaApertura >= horaCierre) {
      return res.status(400).json({ msg: "La hora de cierre debe ser posterior a la hora de apertura." });
    }

    // Verificar si ya existe un horario para ese día
    const horarioExistente = await Horario.findOne({ dia });
    if (horarioExistente) {
      return res.status(400).json({ msg: `Ya existe un horario registrado para el día ${dia}.` });
    }

    const nuevoHorario = new Horario({
      dia,
      horaApertura,
      horaCierre,
      estado: estado !== undefined ? estado : true // Usa el estado proporcionado o true por defecto
    });

    await nuevoHorario.save();
    res.status(201).json({ msg: "Horario creado exitosamente", horario: nuevoHorario });
  } catch (error) {
    console.error("Error al crear horario:", error);
    res.status(500).json({ msg: "Error interno del servidor al crear el horario.", error: error.message });
  }
};

// Listar todos los horarios
const listarHorarios = async (req, res) => {
  try {
    const horarios = await Horario.find().sort({ dia: 1 }); // Ordenar por día
    res.status(200).json(horarios);
  } catch (error) {
    console.error("Error al listar horarios:", error);
    res.status(500).json({ msg: "Error interno del servidor al listar los horarios.", error: error.message });
  }
};

// Obtener un horario específico por ID
const obtenerHorario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de horario no válido." });
    }

    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({ msg: "Horario no encontrado." });
    }

    res.status(200).json(horario);
  } catch (error) {
    console.error("Error al obtener horario:", error);
    res.status(500).json({ msg: "Error interno del servidor al obtener el horario.", error: error.message });
  }
};

// Actualizar un horario existente
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia, horaApertura, horaCierre, estado } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de horario no válido." });
    }

    // Validaciones básicas (opcional, dependiendo de la lógica de negocio)
    if (horaApertura && horaCierre && horaApertura >= horaCierre) {
      return res.status(400).json({ msg: "La hora de cierre debe ser posterior a la hora de apertura." });
    }

    const horarioActualizado = await Horario.findByIdAndUpdate(
      id,
      { dia, horaApertura, horaCierre, estado },
      { new: true, runValidators: true } // Retorna el documento actualizado y ejecuta validaciones
    );

    if (!horarioActualizado) {
      return res.status(404).json({ msg: "Horario no encontrado para actualizar." });
    }

    res.status(200).json({ msg: "Horario actualizado exitosamente", horario: horarioActualizado });
  } catch (error) {
    console.error("Error al actualizar horario:", error);
    res.status(500).json({ msg: "Error interno del servidor al actualizar el horario.", error: error.message });
  }
};

// Eliminar un horario
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params; // <-- Obtiene el ID de los parámetros de la URL

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de horario no válido." });
    }

    const horarioEliminado = await Horario.findByIdAndDelete(id);

    if (!horarioEliminado) {
      return res.status(404).json({ msg: "Horario no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Horario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    res.status(500).json({ msg: "Error interno del servidor al eliminar el horario.", error: error.message });
  }
};


export {
  crearHorario,
  listarHorarios,
  obtenerHorario,
  actualizarHorario,
  eliminarHorario
};