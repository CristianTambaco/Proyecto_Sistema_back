// backend/src/models/Mascota.js
import { Schema, model } from 'mongoose';

const mascotaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    tipoPelaje: {
        type: String,
        required: true,
        enum: ['si', 'no'],
        default: 'si'
    },
    caracteristicas: {
        type: String,
        required: true,
        trim: true
    },
    fechaNacimiento: {
        type: Date,
        default: null
    },
    avatar: {
        type: String,
        trim: true
    },
    avatarID: {
        type: String,
        trim: true
    },
    estado: {
        type: Boolean,
        default: true
    },
    cliente: {
        type: Schema.Types.ObjectId, // ✅ AQUÍ
        ref: 'Cliente',
        required: true
    },
    // --- NUEVOS CAMPOS ---
    raza: {
        type: String,
        trim: true,
        default: ""
    },
    tamaño: {
        type: String,
        enum: ['pequeño', 'mediano', 'grande'],
        trim: true,
        default: "mediano"
    },
    esterilizado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model('Mascota', mascotaSchema);
