import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"

const clienteSchema = new Schema({
    nombrePropietario:{
        type:String,
        required:true,
        trim:true
    },
    cedulaPropietario:{
        type:String,
        required:true,
        trim:true
    },
    emailPropietario:{
        type:String,
        required:true,
        trim:true,
        unique: true
    },
    passwordPropietario:{
        type:String,
        required:true
    },
    celularPropietario:{
        type:String,
        required:true,
        trim:true
    },
    nombreMascota:{
        type:String,
        required:true,
        trim:true
    },
    avatarMascota:{
        type:String,
        trim:true
    },
    avatarMascotaID:{
        type:String,
        trim:true
    },
    avatarMascotaIA:{
        type:String,
        trim:true
    },
    tipoPelajeMascota:{
        type:String,
        required:true,
        trim:true
    },
    fechaNacimientoMascota:{
        type:Date,
        required:false,
        trim:true
    },
    caracteristicasMascota:{
        type:String,
        required:true,
        trim:true
    },
    fechaIngresoMascota:{
        type:Date,
        required:true,
        trim:true,
        default:Date.now
    },
    salidaMascota:{
        type:Date,
        trim:true,
        default:null
    },
    estadoMascota:{
        type:Boolean,
        default:true
    },
    rol:{
        type:String,
        default:"cliente"
    },
    estilista:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Estilista'
    },
    atencions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Atencion'
        }
    ]
},{
    timestamps:true
})


// Método para cifrar el password del propietario
clienteSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

// Método para verificar si el password ingresado es el mismo de la BDD
clienteSchema.methods.matchPassword = async function(password){
    return bcrypt.compare(password, this.passwordPropietario)
}

export default model('Cliente',clienteSchema)