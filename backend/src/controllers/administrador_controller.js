
import mongoose from "mongoose"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import Administrador from "../models/Administrador.js"


const registro = async (req, res) => {
    //! ---->> 1
    const { email, password, cedula } = req.body // <-- Añadir 'cedula' aquí
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    // Validar que la cédula tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
        return res.status(400).json({ msg: "La cédula debe tener exactamente 10 dígitos numéricos." });
    }
    const verificarEmailBDD = await Administrador.findOne({ email })
    if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" })
    // Validar que la cédula no exista
    const verificarCedulaBDD = await Administrador.findOne({ cedula })
    if (verificarCedulaBDD) return res.status(400).json({ msg: "Lo sentimos, la cédula ya se encuentra registrada" }) // <-- Nueva validación
    //! ---->> 3
    const nuevoAdministrador = new Administrador(req.body)
    nuevoAdministrador.password = await nuevoAdministrador.encrypPassword(password)
    const token = nuevoAdministrador.crearToken()
    // await sendMailToRegister(email,token)
    await nuevoAdministrador.save()
    //! ---->> 4
    res.status(200).json({ msg: "Cuenta creada correctamente" })
}




const confirmarMail = async (req, res) => {
    //! ---->> 1
    const { token } = req.params
    //! ---->> 2
    const AdministradorBDD = await Administrador.findOne({ token })
    if (!AdministradorBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" })
    //! ---->> 3
    AdministradorBDD.token = null
    AdministradorBDD.confirmEmail = true
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({ msg: "Cuenta confirmada correctamente" })
}


const recuperarPassword = async (req, res) => {
    //! ---->> 1
    const { email } = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    const AdministradorBDD = await Administrador.findOne({ email })
    if (!AdministradorBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
    //! ---->> 3
    const token = AdministradorBDD.crearToken()
    AdministradorBDD.token = token
    await sendMailToRecoveryPassword(email, token)
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({ msg: "Revisa tu correo para restablecer la contraseña" })
}


const comprobarTokenPassword = async (req, res) => {
    //! ---->> 1
    const { token } = req.params
    //! ---->> 2
    const AdministradorBDD = await Administrador.findOne({ token })
    if (AdministradorBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    //! ---->> 3
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
}



const crearNuevoPassword = async (req, res) => {
    //! ---->> 1
    const { password, confirmPassword } = req.body
    //! ---->> 2
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    if (password !== confirmPassword) return res.status(404).json({ msg: "Lo sentimos, los password no coinciden" })
    const AdministradorBDD = await Administrador.findOne({ token: req.params.token })
    console.log(AdministradorBDD)
    if (AdministradorBDD.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, la cuenta no se puede validar" })
    //! ---->> 3
    AdministradorBDD.token = null
    AdministradorBDD.password = await AdministradorBDD.encrypPassword(password)
    await AdministradorBDD.save()
    //! ---->> 4
    res.status(200).json({ msg: "Felicitaciones, ya puedes inciar sesión con tu nuevo password" })
}



const login = async (req, res) => {

    // 1
    const { email, password } = req.body

    // 2
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })

    const AdministradorBDD = await Administrador.findOne({ email }).select("-status -__v -token -updatedAt -createdAt")

    if (AdministradorBDD?.confirmEmail === false) return res.status(403).json({ msg: "Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión" })

    if (!AdministradorBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })

    const verificarPassword = await AdministradorBDD.matchPassword(password)

    // if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password es incorrecto"})
    if (!verificarPassword) return res.status(401).json({ msg: "Usuario/contraseña incorrecto, por favor vuelva a ingresar." })

    // 3
    const { nombre, apellido, direccion, telefono, _id, rol } = AdministradorBDD

    const token = crearTokenJWT(AdministradorBDD._id, AdministradorBDD.rol)

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





// const login = async (req, res) => {
//   // 1
//   const { email, password } = req.body;
//   // 2
//   if (Object.values(req.body).includes(""))
//     return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

//   const AdministradorBDD = await Administrador.findOne({ email }).select(
//     "-__v -token -updatedAt -createdAt"
//   );

//   if (!AdministradorBDD)
//     return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });

//   //  NUEVA VALIDACIÓN: Verificar si está inactivo
//   if (AdministradorBDD.status === false)
//     return res.status(403).json({ msg: "Tu cuenta está inactiva. Contacta al administrador." });

//   if (AdministradorBDD?.confirmEmail === false)
//     return res.status(403).json({ msg: "Lo sentimos, debes confirmar tu cuenta antes de iniciar sesión" });

//   const verificarPassword = await AdministradorBDD.matchPassword(password);
//   if (!verificarPassword)
//     return res.status(401).json({ msg: "Usuario/contraseña incorrecto, por favor vuelva a ingresar." });

//   // 3
//   const { nombre, apellido, direccion, celular, _id, rol } = AdministradorBDD;
//   const token = crearTokenJWT(AdministradorBDD._id, AdministradorBDD.rol);
//   // 4
//   res.status(200).json({
//     token,
//     rol,
//     nombre,
//     apellido,
//     direccion,
//     celular,
//     _id,
//   });
// };









const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.user; // Cambiado de req.AdministradorBDD
    res.status(200).json(datosPerfil);
}


const actualizarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, direccion, celular, email, status, cedula, passwordnuevo } = req.body; // <-- Añadir passwordnuevo

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ msg: `Lo sentimos, no existe ese registro` });


  const administradorBDD = await Administrador.findById(id);
  if (!administradorBDD)
    return res.status(404).json({ msg: `Lo sentimos, no existe el Administrador ${id}` });

  if (administradorBDD.email != email) {
    const administradorBDDMail = await Administrador.findOne({ email });
    if (administradorBDDMail) {
      return res.status(404).json({ msg: `Lo sentimos, el email ya se encuentra registrado` });
    }
  }

  // Validar unicidad de la cédula si cambia
  if (administradorBDD.cedula != cedula) {
    const cedulaExistente = await Administrador.findOne({ cedula });
    if (cedulaExistente) {
      return res.status(400).json({ msg: "La cédula ya está registrada." });
    }
  }

  administradorBDD.nombre = nombre ?? administradorBDD.nombre;
  administradorBDD.apellido = apellido ?? administradorBDD.apellido;
  administradorBDD.direccion = direccion ?? administradorBDD.direccion;
  administradorBDD.celular = celular ?? administradorBDD.celular;
  administradorBDD.email = email ?? administradorBDD.email;
  administradorBDD.cedula = cedula ?? administradorBDD.cedula;

  // 👇 NUEVO: Si se proporciona una nueva contraseña, actualizarla
  if (passwordnuevo && passwordnuevo.trim() !== "") {
    administradorBDD.password = await administradorBDD.encrypPassword(passwordnuevo);
  }

  // Añadir la actualización del status
  if (status !== undefined) {
    administradorBDD.status = status; // Asegura que sea booleano
  }

  await administradorBDD.save();
  res.status(200).json(administradorBDD);
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



// Controlador para listar estilistas (solo para administrador)
const listarEstilistas = async (req, res) => {
    try {
        // Filtrar estilistas activos
        const estilistas = await Estilista.find({ status: true })
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
        const administradores = await Administrador.find() 
            .select("-password -token -updatedAt -__v") // Excluir campos sensibles
            .sort({ nombre: 1, apellido: 1 }); // Ordenar por nombre y apellido
        return res.status(200).json(administradores);
    } catch (error) {
        console.error("Error en listarAdministradores:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};


// Controlador para eliminar (lógicamente) un administrador - Solo administrador
const eliminarAdministrador = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de administrador no válido." });
        }

        // Buscar y actualizar el estado a false
        const administradorEliminado = await Administrador.findByIdAndUpdate(
            id,
            { status: false }, // Cambia el estado a inactivo
            { new: true } // Retorna el documento actualizado
        );

        if (!administradorEliminado) {
            return res.status(404).json({ msg: "Administrador no encontrado para eliminar." });
        }

        res.status(200).json({ msg: "Administrador eliminado (estado inactivo) exitosamente", administrador: administradorEliminado });
    } catch (error) {
        console.error("Error al eliminar administrador:", error);
        res.status(500).json({ msg: "Error interno del servidor al eliminar el administrador.", error: error.message });
    }
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
    actualizarPassword,
    listarAdministradores,
    listarEstilistas,

    eliminarAdministrador // <-- Añadir esta exportación
}
