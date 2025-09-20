import mongoose, {Schema,model} from 'mongoose'

const atencionSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    descripcion:{
        type:String,
        require:true,
        trim:true
    },
    prioridad:{
        type:String,
        require:true,
        enum:['Baja','Media','Alta']
    },
    cliente:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cliente'
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
    }
},{
    timestamps:true
})

export default model('Atencion',atencionSchema)