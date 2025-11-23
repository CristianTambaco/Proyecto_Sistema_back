import mongoose, { Schema, model } from 'mongoose';

const citaSchema = new Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    estilista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estilista',
        required: false // Opcional si no hay asignación fija
    },
    fechaCita: {
        type: Date,
        required: true
    },
    horaCita: {
        type: String, // formato "HH:mm"
        required: true
    },
    servicio: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'],
        default: 'Pendiente'
    }
}, {
    timestamps: true
});

export default model('Cita', citaSchema);