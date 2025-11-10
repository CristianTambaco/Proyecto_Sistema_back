// backend/src/models/Horario.js
import { Schema, model } from 'mongoose';

const horarioSchema = new Schema({
  // Día de la semana (por ejemplo, "Lunes", "Martes", etc.)
  dia: {
    type: String,
    required: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  },
  // Hora de apertura (formato HH:mm)
  horaApertura: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Valida formato HH:mm
  },
  // Hora de cierre (formato HH:mm)
  horaCierre: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Valida formato HH:mm
  },
  // Estado del horario (activo/inactivo)
  estado: {
    type: Boolean,
    default: true // Por defecto, los horarios están activos
  }
  // Puedes agregar más campos si es necesario, como un ID del estilista si es por estilista
}, {
  timestamps: true // Añade createdAt y updatedAt
});

export default model('Horario', horarioSchema);