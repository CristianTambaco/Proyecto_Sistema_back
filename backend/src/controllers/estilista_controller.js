// backend/src/controllers/estilista_controller.js
import mongoose from "mongoose"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import Estilista from "../models/Estilista.js" // Asegúrate de importar el modelo Estilista
import Administrador from "../models/Administrador.js" // Asegúrate de importar el modelo Administrador



const registro = async (req,res)=>{
    //! ---->> 1
    const { email, password, cedula } = req.body;
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    // Validación de cédula (10 dígitos, solo números)
    if (!/^\d{10}$/.test(cedula)) {
        return res.status(400).json({ msg: "La cédula debe tener exactamente 10 dígitos numéricos." });
    }
    
        const verificarEmailBDD = await Estilista.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})



    //  Validar que la cédula no esté duplicada
    const verificarCedulaBDD = await Estilista.findOne({ cedula });
    if (verificarCedulaBDD) 
        return res.status(400).json({msg: "Lo sentimos, la cédula ya se encuentra registrada"});
        

    //! ---->> 3
    const nuevoEstilista = new Estilista(req.body)
    nuevoEstilista.password = await nuevoEstilista.encrypPassword(password)
    const token = nuevoEstilista.crearToken()

    // await sendMailToRegister(email,token)


    await nuevoEstilista.save()
    //! ---->> 4

    // res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

    res.status(200).json({msg:"Cuenta creada correctamente"})



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



const login = async (req, res) => {
  // 1
  const { email, password } = req.body;
  // 2
  if (Object.values(req.body).includes(""))
    return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

  const estilistaBDD = await Estilista.findOne({ email }).select(
    "-__v -token -updatedAt -createdAt"
  );

  if (!estilistaBDD)
    return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });

  //  NUEVA VALIDACIÓN: Verificar si está inactivo
  if (estilistaBDD.status === false)
    return res.status(403).json({ msg: "Tu cuenta está inactiva. Contacta al administrador." });

  if (estilistaBDD?.confirmEmail === false)
    return res.status(403).json({ msg: "Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión" });

  const verificarPassword = await estilistaBDD.matchPassword(password);
  if (!verificarPassword)
    return res.status(401).json({ msg: "Usuario/contraseña incorrecto, por favor vuelva a ingresar." });

  // 3
  const { nombre, apellido, direccion, celular, _id, rol } = estilistaBDD;
  const token = crearTokenJWT(estilistaBDD._id, estilistaBDD.rol);
  // 4
  res.status(200).json({
    token,
    rol,
    nombre,
    apellido,
    direccion,
    celular,
    _id,
  });
};

const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.user; // Cambiado de req.estilistaBDD
    res.status(200).json(datosPerfil);
}


const actualizarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, direccion, celular, email, status, cedula, passwordnuevo } = req.body; // <-- Añadir passwordnuevo

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ msg: `Lo sentimos, no existe ese registro` });


  const estilistaBDD = await Estilista.findById(id);
  if (!estilistaBDD)
    return res.status(404).json({ msg: `Lo sentimos, no existe el Estilista ${id}` });

  if (estilistaBDD.email != email) {
    const estilistaBDDMail = await Estilista.findOne({ email });
    if (estilistaBDDMail) {
      return res.status(404).json({ msg: `Lo sentimos, el email ya se encuentra registrado` });
    }
  }

  // Validar unicidad de la cédula si cambia
  if (estilistaBDD.cedula != cedula) {
    const cedulaExistente = await Estilista.findOne({ cedula });
    if (cedulaExistente) {
      return res.status(400).json({ msg: "La cédula ya está registrada." });
    }
  }

  estilistaBDD.nombre = nombre ?? estilistaBDD.nombre;
  estilistaBDD.apellido = apellido ?? estilistaBDD.apellido;
  estilistaBDD.direccion = direccion ?? estilistaBDD.direccion;
  estilistaBDD.celular = celular ?? estilistaBDD.celular;
  estilistaBDD.email = email ?? estilistaBDD.email;
  estilistaBDD.cedula = cedula ?? estilistaBDD.cedula;

  // 👇 NUEVO: Si se proporciona una nueva contraseña, actualizarla
  if (passwordnuevo && passwordnuevo.trim() !== "") {
    estilistaBDD.password = await estilistaBDD.encrypPassword(passwordnuevo);
  }

  // Añadir la actualización del status
  if (status !== undefined) {
    estilistaBDD.status = status; // Asegura que sea booleano
  }

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



// Controlador para listar estilistas (solo para administrador)
const listarEstilistas = async (req, res) => {
    try {
        // Filtrar estilistas activos
        const estilistas = await Estilista.find() // 
            .select("-password -token -updatedAt -__v") // Excluir campos sensibles
            .sort({ nombre: 1, apellido: 1 }); // Ordenar por nombre y apellido
        return res.status(200).json(estilistas);
    } catch (error) {
        console.error("Error en listarEstilistas:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};

// Controlador para listar administradores (solo para administrador)
const listarAdministradores = async (req, res) => {
    try {
        // Filtrar administradores activos
        const administradores = await Administrador.find({ status: true })
            .select("-password -token -updatedAt -__v") // Excluir campos sensibles
            .sort({ nombre: 1, apellido: 1 }); // Ordenar por nombre y apellido
        return res.status(200).json(administradores);
    } catch (error) {
        console.error("Error en listarAdministradores:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};



// Controlador para eliminar (lógicamente) un estilista - Solo administrador
const eliminarEstilista = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de estilista no válido." });
        }

        // Buscar y actualizar el estado a false
        const estilistaEliminado = await Estilista.findByIdAndUpdate(
            id,
            { status: false }, // Cambia el estado a inactivo
            { new: true } // Retorna el documento actualizado
        );

        if (!estilistaEliminado) {
            return res.status(404).json({ msg: "Estilista no encontrado para eliminar." });
        }

        res.status(200).json({ msg: "Estilista eliminado (estado inactivo) exitosamente", estilista: estilistaEliminado });
    } catch (error) {
        console.error("Error al eliminar estilista:", error);
        res.status(500).json({ msg: "Error interno del servidor al eliminar el estilista.", error: error.message });
    }
};






export {
    registro, // 
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    listarEstilistas, // <-- Exportar la nueva función
    listarAdministradores, // <-- Exportar la nueva función

    eliminarEstilista // <-- Añadir esta exportación
}
