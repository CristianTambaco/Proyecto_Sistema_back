// backend/src/controllers/mascota_controller.js
import Mascota from '../models/Mascota.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs-extra";

// Registrar una nueva mascota para el cliente autenticado
const crearMascota = async (req, res) => {
    const { nombre, tipoPelaje, caracteristicas, fechaNacimiento } = req.body;
    const clienteId = req.user._id; // El cliente autenticado

    if (!nombre || !tipoPelaje || !caracteristicas) {
        return res.status(400).json({ msg: "Los campos nombre, tipo de pelaje y características son obligatorios." });
    }

    try {
        let avatar = null;
        let avatarID = null;

        if (req.files?.imagen) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Mascotas' });
            avatar = secure_url;
            avatarID = public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        const nuevaMascota = new Mascota({
            nombre,
            tipoPelaje,
            caracteristicas,
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            avatar,
            avatarID,
            cliente: clienteId
        });

        await nuevaMascota.save();

        // Opcional: Puedes actualizar el campo "estadoMascota" del cliente a true si es la primera mascota, o simplemente dejarlo como está.
        // Si quieres que el cliente tenga un estado global, podrías actualizarlo aquí.

        res.status(201).json({ msg: "Mascota registrada exitosamente", mascota: nuevaMascota });
    } catch (error) {
        console.error("Error al crear mascota:", error);
        res.status(500).json({ msg: "Error interno del servidor al crear la mascota.", error: error.message });
    }
};

// Listar todas las mascotas del cliente autenticado
const listarMascotas = async (req, res) => {
    const clienteId = req.user._id;

    try {
        const mascotas = await Mascota.find({ cliente: clienteId }).sort({ createdAt: -1 });
        res.status(200).json(mascotas);
    } catch (error) {
        console.error("Error al listar mascotas:", error);
        res.status(500).json({ msg: "Error interno del servidor al listar las mascotas.", error: error.message });
    }
};

// Obtener una mascota específica por ID (debe pertenecer al cliente)
const obtenerMascota = async (req, res) => {
    const { id } = req.params;
    const clienteId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de mascota no válido." });
    }

    try {
        const mascota = await Mascota.findOne({ _id: id, cliente: clienteId });
        if (!mascota) {
            return res.status(404).json({ msg: "Mascota no encontrada o no tienes permiso para verla." });
        }
        res.status(200).json(mascota);
    } catch (error) {
        console.error("Error al obtener mascota:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener la mascota.", error: error.message });
    }
};

// Actualizar una mascota (debe pertenecer al cliente)
const actualizarMascota = async (req, res) => {
    const { id } = req.params;
    const clienteId = req.user._id;
    const { nombre, tipoPelaje, caracteristicas, fechaNacimiento, estado } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de mascota no válido." });
    }

    try {
        let updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (tipoPelaje !== undefined) updateData.tipoPelaje = tipoPelaje;
        if (caracteristicas !== undefined) updateData.caracteristicas = caracteristicas;
        if (fechaNacimiento !== undefined) updateData.fechaNacimiento = new Date(fechaNacimiento);
        if (estado !== undefined) updateData.estado = estado;

        // Manejar la subida de imagen
        if (req.files?.imagen) {
            const mascotaActual = await Mascota.findById(id);
            if (mascotaActual.avatarID) {
                await cloudinary.uploader.destroy(mascotaActual.avatarID);
            }
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Mascotas' });
            updateData.avatar = secure_url;
            updateData.avatarID = public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        const mascotaActualizada = await Mascota.findOneAndUpdate(
            { _id: id, cliente: clienteId }, // Asegurar que pertenece al cliente
            updateData,
            { new: true, runValidators: true }
        );

        if (!mascotaActualizada) {
            return res.status(404).json({ msg: "Mascota no encontrada o no tienes permiso para actualizarla." });
        }

        res.status(200).json({ msg: "Mascota actualizada exitosamente", mascota: mascotaActualizada });
    } catch (error) {
        console.error("Error al actualizar mascota:", error);
        res.status(500).json({ msg: "Error interno del servidor al actualizar la mascota.", error: error.message });
    }
};

// Eliminar (lógicamente) una mascota (cambiar estado a false)
const eliminarMascota = async (req, res) => {
    const { id } = req.params;
    const clienteId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de mascota no válido." });
    }

    try {
        const mascotaEliminada = await Mascota.findOneAndUpdate(
            { _id: id, cliente: clienteId }, // Asegurar que pertenece al cliente
            { estado: false },
            { new: true }
        );

        if (!mascotaEliminada) {
            return res.status(404).json({ msg: "Mascota no encontrada o no tienes permiso para eliminarla." });
        }

        res.status(200).json({ msg: "Mascota eliminada (estado inactivo) exitosamente", mascota: mascotaEliminada });
    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        res.status(500).json({ msg: "Error interno del servidor al eliminar la mascota.", error: error.message });
    }
};

// Borrar físicamente una mascota (opcional, si se desea)
const borrarMascotaFisicamente = async (req, res) => {
    const { id } = req.params;
    const clienteId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de mascota no válido." });
    }

    try {
        const mascotaBorrada = await Mascota.findOneAndDelete({ _id: id, cliente: clienteId });
        if (!mascotaBorrada) {
            return res.status(404).json({ msg: "Mascota no encontrada o no tienes permiso para borrarla." });
        }
        // Opcional: Borrar la imagen de Cloudinary
        if (mascotaBorrada.avatarID) {
            await cloudinary.uploader.destroy(mascotaBorrada.avatarID);
        }
        res.status(200).json({ msg: "Mascota borrada físicamente exitosamente" });
    } catch (error) {
        console.error("Error al borrar mascota físicamente:", error);
        res.status(500).json({ msg: "Error interno del servidor al borrar la mascota.", error: error.message });
    }
};

export {
    crearMascota,
    listarMascotas,
    obtenerMascota,
    actualizarMascota,
    eliminarMascota,
    borrarMascotaFisicamente
};