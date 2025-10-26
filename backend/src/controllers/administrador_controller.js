
import mongoose from "mongoose"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import Administrador from "../models/Administrador.js"


const registro = async (req,res)=>{
    //! ---->> 1
    const {email,password} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Administrador.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    //! ---->> 3
    const nuevoAdministrador = new Administrador(req.body)
    nuevoAdministrador.password = await nuevoAdministrador.encrypPassword(password)
    const token = nuevoAdministrador.crearToken()

    // await sendMailToRegister(email,token)

    await nuevoAdministrador.save()
    //! ---->> 4
    res.status(200).json({msg:"Cuenta creada correctamente"})
}




const confirmarMail = async(req,res) => { 
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const AdministradorBDD = await Administrador.findOne({token})
    if(!AdministradorBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //! ---->> 3
    AdministradorBDD.token = null
    AdministradorBDD.confirmEmail = true
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Cuenta confirmada correctamente"})
}


const recuperarPassword = async (req,res) => {
    //! ---->> 1
    const {email} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const AdministradorBDD = await Administrador.findOne({email})
    if (!AdministradorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //! ---->> 3
    const token = AdministradorBDD.crearToken()
    AdministradorBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Revisa tu correo para restablecer la contraseña"})
}


const comprobarTokenPassword = async (req,res) => {
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const AdministradorBDD = await Administrador.findOne({token})
    if (AdministradorBDD.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //! ---->> 3
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
}



const crearNuevoPassword = async (req,res) => {
    //! ---->> 1
    const{password,confirmPassword} = req.body
    //! ---->> 2
    if(Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password!==confirmPassword) return res.status(404).json({msg:"Lo sentimos, los password no coinciden"})
    const AdministradorBDD = await Administrador.findOne({token:req.params.token})
    console.log(AdministradorBDD)
    if (AdministradorBDD.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, la cuenta no se puede validar"})
    //! ---->> 3
    AdministradorBDD.token = null
    AdministradorBDD.password = await AdministradorBDD.encrypPassword(password)
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Felicitaciones, ya puedes inciar sesión con tu nuevo password"})
}



const login = async(req,res)=>{

    // 1
    const {email,password} = req.body

    // 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const AdministradorBDD = await Administrador.findOne({email}).select("-status -__v -token -updatedAt -createdAt")

    if(AdministradorBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión"})

    if(!AdministradorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
        
    const verificarPassword = await AdministradorBDD.matchPassword(password)    
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password es incorrecto"})

    // 3
    const {nombre,apellido,direccion,telefono,_id,rol} = AdministradorBDD

    const token = crearTokenJWT(AdministradorBDD._id,AdministradorBDD.rol)

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


const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.user; // Cambiado de req.AdministradorBDD
    res.status(200).json(datosPerfil);
}


const actualizarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, direccion, celular, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    const AdministradorBDD = await Administrador.findById(id);
    if (!AdministradorBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el Administrador ${id}` });

    if (AdministradorBDD.email != email) {
        const AdministradorBDDMail = await Administrador.findOne({ email });
        if (AdministradorBDDMail) {
            return res.status(404).json({ msg: `Lo sentimos, el email ya se encuentra registrado` });
        }
    }

    AdministradorBDD.nombre = nombre ?? AdministradorBDD.nombre;
    AdministradorBDD.apellido = apellido ?? AdministradorBDD.apellido;
    AdministradorBDD.direccion = direccion ?? AdministradorBDD.direccion;
    AdministradorBDD.celular = celular ?? AdministradorBDD.celular;
    AdministradorBDD.email = email ?? AdministradorBDD.email;
    await AdministradorBDD.save();

    res.status(200).json(AdministradorBDD);
};


const actualizarPassword = async (req, res) => {
    const AdministradorBDD = await Administrador.findById(req.user._id); // Cambiado de req.AdministradorBDD._id
    if (!AdministradorBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el Administrador ${id}` });

    const verificarPassword = await AdministradorBDD.matchPassword(req.body.passwordactual);
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" });

    AdministradorBDD.password = await AdministradorBDD.encrypPassword(req.body.passwordnuevo);
    await AdministradorBDD.save();

    res.status(200).json({ msg: "Password actualizado correctamente" });
};


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
