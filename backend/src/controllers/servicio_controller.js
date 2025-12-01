// backend/src/controllers/servicio_controller.js
import Servicio from '../models/Servicio.js';
import mongoose from 'mongoose';

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs-extra";


// Registrar un nuevo servicio
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracionEstimada, estado } = req.body;
    // Validaciones básicas
    if (!nombre || !descripcion || precio === undefined || duracionEstimada === undefined) {
      return res.status(400).json({ msg: "Los campos nombre, descripción, precio y duración estimada son obligatorios." });
    }
    if (precio < 0) {
      return res.status(400).json({ msg: "El precio no puede ser negativo." });
    }
    if (duracionEstimada < 1) {
      return res.status(400).json({ msg: "La duración estimada debe ser al menos 1 minuto." });
    }
    // Verificar si ya existe un servicio con ese nombre
    const servicioExistente = await Servicio.findOne({ nombre: new RegExp(`^${nombre.trim()}$`, 'i') }); // Búsqueda insensible a mayúsculas
    if (servicioExistente) {
      return res.status(400).json({ msg: `Ya existe un servicio registrado con el nombre "${nombre}".` });
    }

    // --- NUEVO: Manejo de la imagen ---
    let imagen = null;
    let imagenID = null;

    // Verificar si se ha enviado una imagen
    if (req.files?.imagen) {
      try {
        // Subir la imagen a Cloudinary
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Servicios' });
        imagen = secure_url;
        imagenID = public_id;
        // Eliminar el archivo temporal del servidor
        await fs.unlink(req.files.imagen.tempFilePath);
      } catch (uploadError) {
        console.error("Error al subir la imagen a Cloudinary:", uploadError);
        return res.status(500).json({ msg: "Error interno del servidor al subir la imagen.", error: uploadError.message });
      }
    }

    const nuevoServicio = new Servicio({
      nombre,
      descripcion,
      precio,
      duracionEstimada,
      estado: estado !== undefined ? estado : true, // Usa el estado proporcionado o true por defecto
      // Añadir los campos de imagen
      imagen: imagen,     // URL pública de la imagen
      imagenID: imagenID  // ID público para borrar en Cloudinary
    });

    await nuevoServicio.save();
    res.status(201).json({ msg: "Servicio creado exitosamente", servicio: nuevoServicio });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ msg: "Error interno del servidor al crear el servicio.", error: error.message });
  }
};


// Listar todos los servicios (activos e inactivos)
const listarServicios = async (req, res) => {
  try {
    // Opcional: Filtrar solo servicios activos si se pasa un query ?activo=true
    const { activo } = req.query;
    let filter = {};
    if (activo === 'true') {
      filter.estado = true;
    } else if (activo === 'false') {
      filter.estado = false;
    }
    const servicios = await Servicio.find(filter).sort({ nombre: 1 }); // Ordenar por nombre
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al listar servicios:", error);
    res.status(500).json({ msg: "Error interno del servidor al listar los servicios.", error: error.message });
  }
};

// Obtener un servicio específico por ID
const obtenerServicio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de servicio no válido." });
    }

    const servicio = await Servicio.findById(id);
    if (!servicio) {
      return res.status(404).json({ msg: "Servicio no encontrado." });
    }

    res.status(200).json(servicio);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    res.status(500).json({ msg: "Error interno del servidor al obtener el servicio.", error: error.message });
  }
};


// Actualizar un servicio existente

// Actualizar un servicio existente
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracionEstimada, estado } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de servicio no válido." });
    }
    // Validaciones básicas
    if (precio !== undefined && precio < 0) {
      return res.status(400).json({ msg: "El precio no puede ser negativo." });
    }
    if (duracionEstimada !== undefined && duracionEstimada < 1) {
      return res.status(400).json({ msg: "La duración estimada debe ser al menos 1 minuto." });
    }
    // Verificar si se está cambiando el nombre y si el nuevo nombre ya existe
    if (nombre) {
        const servicioExistente = await Servicio.findOne({ nombre: new RegExp(`^${nombre.trim()}$`, 'i') });
        if (servicioExistente && servicioExistente._id.toString() !== id) { // Verificar que no sea el mismo servicio
            return res.status(400).json({ msg: `Ya existe un servicio registrado con el nombre "${nombre}".` });
        }
    }
    // Manejar la subida de imagen si existe
    let updateData = {};
    let imagen = null;
    let imagenID = null;

    if (req.files?.imagen) {
      // Si se sube una nueva imagen, eliminar la anterior si existe
      const servicioActualizado = await Servicio.findById(id);
      if (servicioActualizado.imagenID) {
        await cloudinary.uploader.destroy(servicioActualizado.imagenID);
      }
      // Subir la nueva imagen
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Servicios' });
      imagen = secure_url;
      imagenID = public_id;
      // Eliminar el archivo temporal
      await fs.unlink(req.files.imagen.tempFilePath);
      // Añadir los nuevos datos de imagen al objeto de actualización
      updateData.imagen = imagen;
      updateData.imagenID = imagenID;
    }

    // Construir el objeto de actualización con los demás campos
    updateData.nombre = nombre ?? updateData.nombre;
    updateData.descripcion = descripcion ?? updateData.descripcion;
    updateData.precio = precio ?? updateData.precio;
    updateData.duracionEstimada = duracionEstimada ?? updateData.duracionEstimada;
    updateData.estado = estado ?? updateData.estado;

    const servicioActualizado = await Servicio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Retorna el documento actualizado y ejecuta validaciones
    );

    if (!servicioActualizado) {
      return res.status(404).json({ msg: "Servicio no encontrado para actualizar." });
    }

    res.status(200).json({ msg: "Servicio actualizado exitosamente", servicio: servicioActualizado });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ msg: "Error interno del servidor al actualizar el servicio.", error: error.message });
  }
};



// Eliminar un servicio (borrado físico)
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de servicio no válido." });
    }

    const servicioEliminado = await Servicio.findByIdAndDelete(id);

    if (!servicioEliminado) {
      return res.status(404).json({ msg: "Servicio no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ msg: "Error interno del servidor al eliminar el servicio.", error: error.message });
  }
};






// Eliminar un servicio (lógicamente) solo cambia de estado de activo a inactivo un servicio
// const eliminarServicio = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ msg: "ID de servicio no válido." });
//     }

//     // En lugar de borrar físicamente, actualizamos el estado a false
//     const servicioEliminado = await Servicio.findByIdAndUpdate(
//       id,
//       { estado: false }, // Cambiamos el estado a inactivo
//       { new: true } // Retorna el documento actualizado
//     );

//     if (!servicioEliminado) {
//       return res.status(404).json({ msg: "Servicio no encontrado para eliminar." });
//     }

//     res.status(200).json({ msg: "Servicio eliminado (estado inactivo) exitosamente", servicio: servicioEliminado });
//   } catch (error) {
//     console.error("Error al eliminar servicio:", error);
//     res.status(500).json({ msg: "Error interno del servidor al eliminar el servicio.", error: error.message });
//   }
// };






// Opcional: Borrar físicamente un servicio (si se requiere)
const borrarServicioFisicamente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de servicio no válido." });
    }

    const servicioBorrado = await Servicio.findByIdAndDelete(id);

    if (!servicioBorrado) {
      return res.status(404).json({ msg: "Servicio no encontrado para borrar físicamente." });
    }

    res.status(200).json({ msg: "Servicio borrado físicamente exitosamente" });
  } catch (error) {
    console.error("Error al borrar servicio físicamente:", error);
    res.status(500).json({ msg: "Error interno del servidor al borrar el servicio físicamente.", error: error.message });
  }
};

export {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio // Borrado físico
};