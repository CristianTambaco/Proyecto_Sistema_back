
import mongoose from "mongoose"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import Veterinario from "../models/Veterinario.js"





const registro = async (req,res)=>{
    //! ---->> 1
    const {email,password} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Veterinario.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    //! ---->> 3
    const nuevoVeterinario = new Veterinario(req.body)
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    const token = nuevoVeterinario.crearToken()
    await sendMailToRegister(email,token)
    await nuevoVeterinario.save()
    //! ---->> 4
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}




const confirmarMail = async(req,res) => { 
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const veterinarioBDD = await Veterinario.findOne({token})
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //! ---->> 3
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail = true
    await veterinarioBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Cuenta confirmada correctamente"})
}


const recuperarPassword = async (req,res) => {
    //! ---->> 1
    const {email} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email})
    if (!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //! ---->> 3
    const token = veterinarioBDD.crearToken()
    veterinarioBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Revisa tu correo para restablecer la contraseña"})
}


const comprobarTokenPassword = async (req,res) => {
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const veterinarioBDD = await Veterinario.findOne({token})
    if (veterinarioBDD.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //! ---->> 3
    await veterinarioBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
}



const crearNuevoPassword = async (req,res) => {
    //! ---->> 1
    const{password,confirmPassword} = req.body
    //! ---->> 2
    if(Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password!==confirmPassword) return res.status(404).json({msg:"Lo sentimos, los password no coinciden"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    console.log(veterinarioBDD)
    if (veterinarioBDD.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, la cuenta no se puede validar"})
    //! ---->> 3
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    await veterinarioBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Felicitacioens, ya puedes inciar sesión con tu nuevo password"})
}



const login = async(req,res)=>{

    // 1
    const {email,password} = req.body

    // 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")

    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión"})

    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
        
    const verificarPassword = await veterinarioBDD.matchPassword(password)    
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password es incorrecto"})

    // 3
    const {nombre,apellido,direccion,telefono,_id,rol} = veterinarioBDD

    const token = crearTokenJWT(veterinarioBDD._id,veterinarioBDD.rol)

    // 4
    res.status(200).json({
        token,
        rol,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        
    })
}


const perfil =(req,res)=>{
		const {token,confirmEmail,createdAt,updatedAt,__v,...datosPerfil} = req.veterinarioBDD
    res.status(200).json(datosPerfil)
}


const actualizarPerfil = async (req,res)=>{

    const {id} = req.params

    const {nombre,apellido,direccion,celular,email} = req.body
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})


    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email != email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el email existe ya se encuentra registrado`})  
        }
    }
    veterinarioBDD.nombre = nombre ?? veterinarioBDD.nombre
    veterinarioBDD.apellido = apellido ?? veterinarioBDD.apellido
    veterinarioBDD.direccion = direccion ?? veterinarioBDD.direccion
    veterinarioBDD.celular = celular ?? veterinarioBDD.celular
    veterinarioBDD.email = email ?? veterinarioBDD.email

    await veterinarioBDD.save()

    console.log(veterinarioBDD)

    res.status(200).json(veterinarioBDD)
}


const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword
}
