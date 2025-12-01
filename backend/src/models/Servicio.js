// backend/src/models/Servicio.js
import { Schema, model } from 'mongoose';

const servicioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  duracionEstimada: {
    type: Number,
    required: true,
    min: 1
  },
  estado: {
    type: Boolean,
    default: true
  },
  // --- NUEVOS CAMPOS PARA IMAGEN ---
  imagen: { // URL pública de la imagen en Cloudinary
    type: String,
    trim: true
  },
  imagenID: { // ID público para borrar en Cloudinary (opcional)
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default model('Servicio', servicioSchema);