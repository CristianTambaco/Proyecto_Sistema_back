import Paciente from "../models/Paciente.js"
import { sendMailToOwner } from "../config/nodemailer.js"

import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

import mongoose from "mongoose"


import Tratamiento from "../models/Tratamiento.js"


const registrarPaciente = async(req,res)=>{
    
    // 1 obtener los datos del frontend o cliente rest
    const {emailPropietario} = req.body

    // 2 validaciones
    if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        const verificarEmailBDD = await Paciente.findOne({emailPropietario})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

    // 3 logica del negocio
    const password = Math.random().toString(36).toUpperCase().slice(2,5) // BDF45
    const nuevoPaciente = new Paciente({
        ...req.body,
        passwordPropietario: await Paciente.prototype.encrypPassword("VET"+password),  //<----
        veterinario:req.veterinarioBDD?._id
    })




    if (req.files?.imagen){
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Pacientes'})
        nuevoPaciente.avatarMascota = secure_url
        nuevoPaciente.avatarMascotaID = public_id
        await fs.unlink(req.files.imagen.tempFilePath)

    }
    if (req.files?.avatarmascotaIA){
    }




    await sendMailToOwner(emailPropietario, "VET"+password)
    await nuevoPaciente.save()
    
    // 4 responder
    res.status(201).json({msg:"Registro exitoso de la mascota"})

}




const listarPacientes = async (req,res)=>{
    if (req.pacienteBDD?.rol ==="paciente"){
        const pacientes = await Paciente.find(req.pacienteBDD._id).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
        res.status(200).json(pacientes)
    }
    else{
        const pacientes = await Paciente.find({estadoMascota:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
        res.status(200).json(pacientes)
    }
}


const detallePaciente = async(req,res)=>{

    // siempre tiene estas 4 actividades

    // 1 obtener los datos del frontend o cliente rest
    const {id} = req.params
    // 2 validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el paciente con ese id ${id}`});

    // 3 logica del negocio
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    // 4 responder
    const tratamientos = await Tratamiento.find().where('paciente').equals(id)
    
    
    res.status(200).json({
        paciente,
        tratamientos
    })
    
    
}



const detallepacienteac = async(req,res)=>{

    // siempre tiene estas 4 actividades

    // 1 obtener los datos del frontend o cliente rest
    const {id} = req.params
    // 2 validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el paciente con ese id ${id}`});

    // 3 logica del negocio
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    // 4 responder
    const tratamientos = await Tratamiento.find().where('paciente').equals(id)
    
    
    res.status(200).json(paciente)
    
    
}





const eliminarPaciente = async (req,res)=>{
    // Se obtiene el ID del paciente de los parámetros de la solicitud [1]
    const {id} = req.params
    
    // Se verifica que el cuerpo de la solicitud no esté vacío [1]
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"}) // Este mensaje puede ser más específico [1]
    
    // Se valida que el ID proporcionado sea un ObjectId válido de Mongoose [1]
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el paciente ${id}`}) // Este mensaje puede ser más específico para pacientes [1]
    
    // Se obtiene el campo 'salidaMascota' del cuerpo de la solicitud [1]
    const {salidaMascota} = req.body
    
    // Se busca el paciente por su ID y se actualiza el campo 'salidaMascota' [1]
    // Mongoose.findByIdAndUpdate() es el método usado para esta actualización lógica [1]
    await Paciente.findByIdAndUpdate(req.params.id,{salidaMascota:Date.parse(salidaMascota),estadoMascota:false})
    
    // Se envía una respuesta de éxito indicando que la fecha de salida ha sido registrada [1]
    res.status(200).json({msg:"Fecha de salida de la mascota registrado exitosamente"})



}



const actualizarPaciente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (req.files?.imagen) {
        const paciente = await Paciente.findById(id)
        if (paciente.avatarMascotaID) {
            await cloudinary.uploader.destroy(paciente.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Pacientes' });
        req.body.avatarMascota = cloudiResponse.secure_url;
        req.body.avatarMascotaID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }
    await Paciente.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del paciente"})
}




import { crearTokenJWT } from "../middlewares/JWT.js"


const loginPropietario = async(req,res)=>{



    
    const {email:emailPropietario,password:passwordPropietario} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const pacienteBDD = await Paciente.findOne({emailPropietario})
    if(!pacienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})


    const verificarPassword = await pacienteBDD.matchPassword(passwordPropietario)



    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = crearTokenJWT(pacienteBDD._id,pacienteBDD.rol)
	const {_id,rol} = pacienteBDD
    res.status(200).json({
        token,
        rol,
        _id
    })
}



const perfilPropietario = (req, res) => {
    
    const camposAEliminar = [
        "fechaIngresoMascota", "sintomasMascota", "salidaMascota",
        "estadoMascota", "veterinario", "tipoMascota",
        "fechaNacimientoMascota", "passwordPropietario", 
        "avatarMascota", "avatarMascotaIA","avatarMascotaID", "createdAt", "updatedAt", "__v"
    ]

    camposAEliminar.forEach(campo => delete req.pacienteBDD[campo])

    res.status(200).json(req.pacienteBDD)
}




export{
    registrarPaciente,
    listarPacientes,
    detallePaciente,
    detallepacienteac,
    eliminarPaciente,
    actualizarPaciente,
    loginPropietario,
    perfilPropietario
}



















