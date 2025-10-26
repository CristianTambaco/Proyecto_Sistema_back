import Cliente from "../models/Cliente.js"
import { sendMailToOwner } from "../config/nodemailer.js"

import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

import mongoose from "mongoose"


import Atencion from "../models/Atencion.js"


const registrarCliente = async(req,res)=>{
    
    // 1 obtener los datos del frontend o cliente rest
    const {emailPropietario} = req.body

    // 2 validaciones
    if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        const verificarEmailBDD = await Cliente.findOne({emailPropietario})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

    // 3 logica del negocio
    const password = Math.random().toString(36).toUpperCase().slice(2,5) // BDF45
    const nuevoCliente = new Cliente({
        ...req.body,
        passwordPropietario: await Cliente.prototype.encrypPassword("CLI"+password),  //<----
        estilista:req.estilistaBDD?._id
    })




    if (req.files?.imagen){
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Clientes'})
        nuevoCliente.avatarMascota = secure_url
        nuevoCliente.avatarMascotaID = public_id
        await fs.unlink(req.files.imagen.tempFilePath)

    }
    if (req.files?.avatarmascotaIA){
    }




    await sendMailToOwner(emailPropietario, "CLI"+password)
    await nuevoCliente.save()
    
    // 4 responder
    res.status(201).json({msg:"El registro fue exitoso"})

}




const listarClientes = async (req,res)=>{
    if (req.clienteBDD?.rol ==="cliente"){
        const clientes = await Cliente.find(req.clienteBDD._id).select("-salida -createdAt -updatedAt -__v").populate('estilista','_id nombre apellido')
        res.status(200).json(clientes)
    }
    else{
        const clientes = await Cliente.find({estadoMascota:true}).where('estilista').equals(req.estilistaBDD).select("-salida -createdAt -updatedAt -__v").populate('estilista','_id nombre apellido')
        res.status(200).json(clientes)
    }
}


const detalleCliente = async(req,res)=>{

    // siempre tiene estas 4 actividades

    // 1 obtener los datos del frontend o cliente rest
    const {id} = req.params
    // 2 validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el cliente con ese id ${id}`});

    // 3 logica del negocio
    const cliente = await Cliente.findById(id).select("-createdAt -updatedAt -__v").populate('estilista','_id nombre apellido')
    // 4 responder
    const atencions = await Atencion.find().where('cliente').equals(id)
    
    
    res.status(200).json({
        cliente,
        atencions
    })
    
    
}



const detalleclienteac = async(req,res)=>{

    // siempre tiene estas 4 actividades

    // 1 obtener los datos del frontend o cliente rest
    const {id} = req.params
    // 2 validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el cliente con ese id ${id}`});

    // 3 logica del negocio
    const cliente = await Cliente.findById(id).select("-createdAt -updatedAt -__v").populate('estilista','_id nombre apellido')
    // 4 responder
    const atencions = await Atencion.find().where('cliente').equals(id)
    
    
    res.status(200).json(cliente)
    
    
}





const eliminarCliente = async (req,res)=>{
    // Se obtiene el ID del cliente de los parámetros de la solicitud [1]
    const {id} = req.params
    
    // Se verifica que el cuerpo de la solicitud no esté vacío [1]
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"}) // Este mensaje puede ser más específico [1]
    
    // Se valida que el ID proporcionado sea un ObjectId válido de Mongoose [1]
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el cliente ${id}`}) // Este mensaje puede ser más específico para clientes [1]
    
    // Se obtiene el campo 'salidaMascota' del cuerpo de la solicitud [1]
    const {salidaMascota} = req.body
    
    // Se busca el cliente por su ID y se actualiza el campo 'salidaMascota' [1]
    // Mongoose.findByIdAndUpdate() es el método usado para esta actualización lógica [1]
    await Cliente.findByIdAndUpdate(req.params.id,{salidaMascota:Date.parse(salidaMascota),estadoMascota:false})
    
    // Se envía una respuesta de éxito indicando que la fecha de salida ha sido registrada [1]

    // res.status(200).json({msg:"Fecha de salida de la mascota registrado exitosamente"})
    
    res.status(200).json({msg:"El registro fue eliminado correctamente"})


}



const actualizarCliente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el estilista ${id}`})
    if (req.files?.imagen) {
        const cliente = await Cliente.findById(id)
        if (cliente.avatarMascotaID) {
            await cloudinary.uploader.destroy(cliente.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Clientes' });
        req.body.avatarMascota = cloudiResponse.secure_url;
        req.body.avatarMascotaID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }
    await Cliente.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del cliente"})
}




import { crearTokenJWT } from "../middlewares/JWT.js"


const loginPropietario = async(req,res)=>{



    
    const {email:emailPropietario,password:passwordPropietario} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const clienteBDD = await Cliente.findOne({emailPropietario})
    if(!clienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})


    const verificarPassword = await clienteBDD.matchPassword(passwordPropietario)



    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = crearTokenJWT(clienteBDD._id,clienteBDD.rol)
	const {_id,rol} = clienteBDD
    res.status(200).json({
        token,
        rol,
        _id
    })
}



const perfilPropietario = (req, res) => {
    
    const camposAEliminar = [
        "fechaIngresoMascota", "caracteristicasMascota", "salidaMascota",
        "estadoMascota", "estilista", "tipoPelajeMascota",
        "fechaNacimientoMascota", "passwordPropietario", 
        "avatarMascota", "avatarMascotaIA","avatarMascotaID", "createdAt", "updatedAt", "__v"
    ]

    camposAEliminar.forEach(campo => delete req.clienteBDD[campo])

    res.status(200).json(req.clienteBDD)
}




export{
    registrarCliente,
    listarClientes,
    detalleCliente,
    detalleclienteac,
    eliminarCliente,
    actualizarCliente,
    loginPropietario,
    perfilPropietario
}



















