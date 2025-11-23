// backend/src/models/TrabajoRealizado.js
import mongoose, { Schema, model } from 'mongoose';

const trabajoRealizadoSchema = new Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    estilista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estilista',
        required: true
    },
    nombreServicio: {
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
        enum: ['Baja', 'Media', 'Alta'],
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    fechaRealizacion: {
        type: Date,
        default: Date.now
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // createdAt, updatedAt
});

export default model('TrabajoRealizado', trabajoRealizadoSchema);