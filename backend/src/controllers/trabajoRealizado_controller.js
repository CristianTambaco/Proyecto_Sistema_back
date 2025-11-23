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
            estilista: req.user._id, // ID del estilista autenticado
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

// Listar todos los trabajos (estilista ve los suyos, admin ve todos)
export const listarTrabajos = async (req, res) => {
    try {
        let query = {};
        if (req.user.rol === 'estilista') {
            query.estilista = req.user._id;
        }
        // Si es admin, no se filtra → verá todos

        const trabajos = await TrabajoRealizado.find(query)
            .populate('cliente', 'nombrePropietario nombreMascota emailPropietario')
            .populate('estilista', 'nombre apellido')
            .sort({ fechaRealizacion: -1 }); // más recientes primero

        res.status(200).json(trabajos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al listar trabajos" });
    }
};