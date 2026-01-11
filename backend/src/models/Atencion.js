// backend/src/models/Atencion.js
import mongoose, { Schema, model } from 'mongoose';

const atencionSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    prioridad: {
        type: String,
        required: true,
        enum: ['Baja', 'Media', 'Alta']
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true // Aseguramos que siempre tenga un cliente asignado
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado'],
        default: 'Pendiente'
    },

    // NUEVO CAMPO: Estado de la atención (Atendido/Pendiente)
    estadoAtencion: {
    type: String,
    enum: ['Pendiente', 'Atendido', 'No Asistió'],
    default: 'Pendiente' // Por defecto es 'Pendiente'
    },



    // Nuevo campo: Fecha de la cita (para citas futuras)
    // Campos para la cita
    fechaCita: {
        type: Date,
        required: true //  obligatorio
    },
    horaCita: {
        type: String, // "HH:mm"
        required: true
    }
}, {
    timestamps: true // Esto añade createdAt y updatedAt
});

export default model('Atencion', atencionSchema);