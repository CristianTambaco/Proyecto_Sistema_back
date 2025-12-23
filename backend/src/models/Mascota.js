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
    }
}, {
    timestamps: true
});

export default model('Mascota', mascotaSchema);
