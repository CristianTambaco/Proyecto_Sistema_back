import Cita from '../models/Cita.js';
import mongoose from 'mongoose';

// Listar todas las citas (solo para estilista y administrador)
const listarCitas = async (req, res) => {
    try {
        // Validar rol en la ruta (se hará en el router)
        const citas = await Cita.find()
            .populate('cliente', 'nombrePropietario nombreMascota emailPropietario')
            .populate('estilista', 'nombre apellido')
            .sort({ fechaCita: 1, horaCita: 1 });
        res.status(200).json(citas);
    } catch (error) {
        console.error("Error al listar citas:", error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

export { listarCitas };