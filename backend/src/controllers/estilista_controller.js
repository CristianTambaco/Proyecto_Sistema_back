
import mongoose from "mongoose"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import Estilista from "../models/Estilista.js"





const registro = async (req,res)=>{
    //! ---->> 1
    const {email,password} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Estilista.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    //! ---->> 3
    const nuevoEstilista = new Estilista(req.body)
    nuevoEstilista.password = await nuevoEstilista.encrypPassword(password)
    const token = nuevoEstilista.crearToken()
    await sendMailToRegister(email,token)
    await nuevoEstilista.save()
    //! ---->> 4
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}




const confirmarMail = async(req,res) => { 
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const estilistaBDD = await Estilista.findOne({token})
    if(!estilistaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //! ---->> 3
    estilistaBDD.token = null
    estilistaBDD.confirmEmail = true
    await estilistaBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Cuenta confirmada correctamente"})
}


const recuperarPassword = async (req,res) => {
    //! ---->> 1
    const {email} = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const estilistaBDD = await Estilista.findOne({email})
    if (!estilistaBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //! ---->> 3
    const token = estilistaBDD.crearToken()
    estilistaBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await estilistaBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Revisa tu correo para restablecer la contraseña"})
}


const comprobarTokenPassword = async (req,res) => {
    //! ---->> 1
    const {token} = req.params
    //! ---->> 2
    const estilistaBDD = await Estilista.findOne({token})
    if (estilistaBDD.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //! ---->> 3
    await estilistaBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
}



const crearNuevoPassword = async (req,res) => {
    //! ---->> 1
    const{password,confirmPassword} = req.body
    //! ---->> 2
    if(Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password!==confirmPassword) return res.status(404).json({msg:"Lo sentimos, los password no coinciden"})
    const estilistaBDD = await Estilista.findOne({token:req.params.token})
    console.log(estilistaBDD)
    if (estilistaBDD.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, la cuenta no se puede validar"})
    //! ---->> 3
    estilistaBDD.token = null
    estilistaBDD.password = await estilistaBDD.encrypPassword(password)
    await estilistaBDD.save()
    //! ---->> 4
    res.status(200).json({msg:"Felicitaciones, ya puedes inciar sesión con tu nuevo password"})
}



const login = async(req,res)=>{

    // 1
    const {email,password} = req.body

    // 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const estilistaBDD = await Estilista.findOne({email}).select("-status -__v -token -updatedAt -createdAt")

    if(estilistaBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión"})

    if(!estilistaBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
        
    const verificarPassword = await estilistaBDD.matchPassword(password)    
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password es incorrecto"})

    // 3
    const {nombre,apellido,direccion,telefono,_id,rol} = estilistaBDD

    const token = crearTokenJWT(estilistaBDD._id,estilistaBDD.rol)

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
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.user; // Cambiado de req.estilistaBDD
    res.status(200).json(datosPerfil);
}


const actualizarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, direccion, celular, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    const estilistaBDD = await Estilista.findById(id); // Aquí puedes usar req.user._id si quieres, pero es más seguro usar el id de params
    if (!estilistaBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el estilista ${id}` });

    if (estilistaBDD.email != email) {
        const estilistaBDDMail = await Estilista.findOne({ email });
        if (estilistaBDDMail) {
            return res.status(404).json({ msg: `Lo sentimos, el email ya se encuentra registrado` });
        }
    }

    estilistaBDD.nombre = nombre ?? estilistaBDD.nombre;
    estilistaBDD.apellido = apellido ?? estilistaBDD.apellido;
    estilistaBDD.direccion = direccion ?? estilistaBDD.direccion;
    estilistaBDD.celular = celular ?? estilistaBDD.celular;
    estilistaBDD.email = email ?? estilistaBDD.email;
    await estilistaBDD.save();

    res.status(200).json(estilistaBDD);
};


const actualizarPassword = async (req, res) => {
    const estilistaBDD = await Estilista.findById(req.user._id); // Cambiado de req.estilistaBDD._id
    if (!estilistaBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el estilista ${id}` });

    const verificarPassword = await estilistaBDD.matchPassword(req.body.passwordactual);
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" });

    estilistaBDD.password = await estilistaBDD.encrypPassword(req.body.passwordnuevo);
    await estilistaBDD.save();

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
