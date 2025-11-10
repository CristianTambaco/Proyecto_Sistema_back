// backend/src/models/Servicio.js
import { Schema, model } from 'mongoose';

const servicioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true // Asegura que no haya dos servicios con el mismo nombre
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0 // El precio no puede ser negativo
  },
  duracionEstimada: { // Por ejemplo, en minutos
    type: Number,
    required: true,
    min: 1
  },
  estado: {
    type: Boolean,
    default: true // Por defecto, los servicios están activos
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

export default model('Servicio', servicioSchema);