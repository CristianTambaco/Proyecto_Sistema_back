import Cliente from "../models/Cliente.js"
import { sendMailToOwner } from "../config/nodemailer.js"

import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

import mongoose from "mongoose"


import Atencion from "../models/Atencion.js"

import { sendMailToRecoveryPassword } from "../config/nodemailer.js";


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




const listarClientes = async (req, res) => {
    try {
        const { rol } = req.user;

        if (rol === "cliente") {
            // Cliente solo ve su propio registro
            const cliente = await Cliente.findById(req.user._id)
                .select("-salida -createdAt -updatedAt -__v")
                .populate('estilista', '_id nombre apellido');
            if (!cliente) {
                return res.status(404).json({ msg: "Cliente no encontrado" });
            }
            return res.status(200).json([cliente]);
        }

        if (rol === "estilista") {
            // Estilista ve clientes activos
            const clientes = await Cliente.find({ 
                estadoMascota: true, 
                
            })
            .select("-salida -createdAt -updatedAt -__v")
            .populate('estilista', '_id nombre apellido');
            return res.status(200).json(clientes);
        }

        if (rol === "administrador") {
            // ✅ Administrador ve TODOS los clientes (activos e inactivos), sin filtro por estilista
            const clientes = await Cliente.find()
                .select("-salida -createdAt -updatedAt -__v")
                .populate('estilista', '_id nombre apellido');
            return res.status(200).json(clientes);
        }

        return res.status(403).json({ msg: "Rol no autorizado" });

    } catch (error) {
        console.error("Error en listarClientes:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};


const detalleCliente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el cliente con ese id ${id}` });

    // Obtener el cliente
    const cliente = await Cliente.findById(id).select("-createdAt -updatedAt -__v").populate('estilista', '_id nombre apellido');

    // Obtener las atenciones del cliente y populate con los datos del cliente (nombrePropietario, nombreMascota)
    const atencions = await Atencion.find({ cliente: id })
        .populate('cliente', 'nombrePropietario nombreMascota emailPropietario') // <-- ¡ESTA ES LA CLAVE!
        .sort({ createdAt: -1 }); // Opcional: ordenar por fecha

    res.status(200).json({
        cliente,
        atencions
    });
};



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
    const { rol } = req.user; // Obtener el rol del usuario autenticado

    // Verificar que el ID sea válido
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el cliente ${id}`})

    // Extraer campos del cuerpo
    const { estadoMascota, salidaMascota, ...otrosDatos } = req.body;

    // Permitir que el cliente actualice su propio perfil
    if (rol === 'cliente') {
        // Validar que el cliente solo pueda actualizar su propio registro
        

        // Permitir solo campos relacionados con la mascota y propietario que el cliente puede modificar
        const camposPermitidos = [
            'nombrePropietario', 'cedulaPropietario', 'emailPropietario',
            'celularPropietario', 'nombreMascota', 'tipoPelajeMascota',
            'caracteristicasMascota'
        ];

        // Filtrar req.body para solo incluir campos permitidos
        const datosFiltrados = {};
        Object.keys(otrosDatos).forEach(key => {
            if (camposPermitidos.includes(key)) {
                datosFiltrados[key] = otrosDatos[key];
            }
        });
        req.body = datosFiltrados; // Reemplazar req.body con los datos filtrados

        // El cliente no puede cambiar el estado de la mascota ni la fecha de salida
        delete req.body.estadoMascota;
        delete req.body.salidaMascota;
    }
    // Si es estilista o administrador, pueden cambiar todos los campos
    else if (rol === 'estilista' || rol === 'administrador' || rol === 'cliente') {
        // No hay restricción adicional, permitir todos los campos
    } else {
        return res.status(403).json({ msg: 'Acceso denegado. Rol no autorizado para actualizar perfil.' });
    }

    // Manejar la subida de imagen si existe (esto probablemente no lo hará un cliente estándar)
    if (req.files?.imagen && rol !== 'clientew') { // Solo estilista/admin pueden cambiar imagen
        const cliente = await Cliente.findById(id)
        if (cliente.avatarMascotaID) {
            await cloudinary.uploader.destroy(cliente.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Clientes' });
        req.body.avatarMascota = cloudiResponse.secure_url;
        req.body.avatarMascotaID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }

    // Construir el objeto de actualización
    let updateData = req.body;

    // Solo estilista/admin puede actualizar estadoMascota
    if (rol !== 'cliente' && estadoMascota !== undefined) {
        updateData.estadoMascota = estadoMascota;
    }
    if (rol !== 'cliente' && salidaMascota !== undefined) {
        updateData.salidaMascota = Date.parse(salidaMascota);
    }

    // Verificar que el cliente existe
    const clienteActualizado = await Cliente.findByIdAndUpdate(id, updateData, { new: true })
    if (!clienteActualizado) {
        return res.status(404).json({ msg: `Lo sentimos, no existe el cliente ${id}` });
    }

    res.status(200).json({msg:"Actualización exitosa. ", cliente: clienteActualizado});
};






import { crearTokenJWT } from "../middlewares/JWT.js"


const loginPropietario = async(req,res)=>{



    
    const {email:emailPropietario,password:passwordPropietario} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const clienteBDD = await Cliente.findOne({emailPropietario})
    if(!clienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})


    const verificarPassword = await clienteBDD.matchPassword(passwordPropietario)



    if(!verificarPassword) return res.status(404).json({msg:"Usuario/contraseña incorrecto, por favor vuelva a ingresar."})
    // if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})

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

    // Eliminar campos del objeto req.user
    camposAEliminar.forEach(campo => delete req.user[campo]);

    res.status(200).json(req.user); // Cambiado de req.clienteBDD
}




// Modificar la función registrarClientePublico
const registrarClientePublico = async(req,res)=>{
    // 1 obtener los datos del frontend o cliente rest
    const {emailPropietario, passwordPropietario} = req.body // <-- Añadir passwordPropietario
    // 2 validaciones
    // if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
        const verificarEmailBDD = await Cliente.findOne({emailPropietario})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

    // Validar la contraseña aquí si es necesario (mínimo de caracteres, patrón, etc.)
    if (!passwordPropietario || passwordPropietario.length < 8) { // Ajusta según tus requisitos
         return res.status(400).json({msg:"Lo sentimos, la contraseña debe tener al menos 8 caracteres."});
    }

    // 3 logica del negocio
    const nuevoCliente = new Cliente({
        ...req.body,
        // passwordPropietario: await Cliente.prototype.encrypPassword("CLI"+password),  //<---- COMENTAR ESTA LÍNEA (si existiera)
        passwordPropietario: await Cliente.prototype.encrypPassword(passwordPropietario), // <-- USAR ESTA LÍNEA
        estilista:null // <-- No tiene estilista asignado
    })

    if (req.files?.imagen){
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Clientes'})
        nuevoCliente.avatarMascota = secure_url
        nuevoCliente.avatarMascotaID = public_id
        await fs.unlink(req.files.imagen.tempFilePath)
    }
    if (req.files?.avatarmascotaIA){
    }
    // COMENTAR O ELIMINAR ESTA LÍNEA PARA NO ENVIAR CORREO
    // await sendMailToOwner(emailPropietario, passwordPropietario) // <-- Comentar esta línea

    await nuevoCliente.save()
    // 4 responder
    res.status(201).json({msg:"El registro fue exitoso"})
}




// Función para actualizar la contraseña del cliente
const actualizarPasswordCliente = async (req, res) => {
    const clienteId = req.params.id;
    const clienteSesionId = req.user._id; // req.user._id es el ID del cliente autenticado

    // Verificar que el ID en la URL sea el mismo que el del token
    if (clienteId.toString() !== clienteSesionId.toString()) {
        return res.status(403).json({ msg: "Acceso denegado. No puedes cambiar la contraseña de otro usuario." });
    }

    const { passwordactual, passwordnuevo } = req.body;

    // Validaciones básicas
    if (!passwordactual || !passwordnuevo) {
        return res.status(400).json({ msg: "La contraseña actual y la nueva contraseña son obligatorias." });
    }

    // Buscar el cliente en la base de datos
    const clienteBDD = await Cliente.findById(clienteId);
    if (!clienteBDD) {
        return res.status(404).json({ msg: `Lo sentimos, no existe el cliente.` });
    }

    // Verificar la contraseña actual
    const verificarPassword = await clienteBDD.matchPassword(passwordactual);
    if (!verificarPassword) {
        return res.status(400).json({ msg: "Lo sentimos, la contraseña actual no es correcta." });
    }

    // Encriptar la nueva contraseña
    clienteBDD.passwordPropietario = await clienteBDD.encrypPassword(passwordnuevo);

    // Guardar el cliente actualizado
    await clienteBDD.save();

    res.status(200).json({ msg: "Contraseña actualizada correctamente." });
};





const registrarClientePorAdmin = async(req,res)=>{
    // 1. Obtener los datos del frontend
    const {emailPropietario, passwordPropietario} = req.body // <-- Añadir passwordPropietario

    // 2. Validaciones
    // if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
        const verificarEmailBDD = await Cliente.findOne({emailPropietario})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

    // Validar la contraseña aquí si es necesario (mínimo de caracteres, patrón, etc.)
    if (!passwordPropietario || passwordPropietario.length < 8) { // Ajusta según tus requisitos
         return res.status(400).json({msg:"Lo sentimos, la contraseña debe tener al menos 8 caracteres."});
    }

    // 3. Lógica del negocio
    const nuevoCliente = new Cliente({
        ...req.body,
        passwordPropietario: await Cliente.prototype.encrypPassword(passwordPropietario), // <-- Usar la contraseña proporcionada
        estilista: req.body.estilista || null // Permitir asignar estilista opcionalmente
    })

    if (req.files?.imagen){
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Clientes'})
        nuevoCliente.avatarMascota = secure_url
        nuevoCliente.avatarMascotaID = public_id
        await fs.unlink(req.files.imagen.tempFilePath)
    }

    // ❌ NO ENVIAR CORREO
    // await sendMailToOwner(emailPropietario, passwordPropietario)

    await nuevoCliente.save()

    // 4. Responder
    res.status(201).json({msg:"Cliente creado exitosamente"}) // <-- Mensaje sin mencionar correo
}


// Paso 1: Enviar token por correo
export const recuperarPasswordCliente = async (req, res) => {
  const { email: emailPropietario } = req.body;
  if (!emailPropietario) {
    return res.status(400).json({ msg: "El correo es obligatorio." });
  }

  const clienteBDD = await Cliente.findOne({ emailPropietario });
  if (!clienteBDD) {
    return res.status(404).json({ msg: "No existe un cliente con ese correo." });
  }

  const token = clienteBDD.crearToken(); // Necesitas implementar este método (más abajo)
  clienteBDD.token = token;
  await clienteBDD.save();

  await sendMailToRecoveryPassword(emailPropietario, token);
  res.status(200).json({ msg: "Revisa tu correo para restablecer la contraseña." });
};

// Paso 2: Verificar token
export const comprobarTokenPasswordCliente = async (req, res) => {
  const { token } = req.params;
  const clienteBDD = await Cliente.findOne({ token });
  if (!clienteBDD) {
    return res.status(404).json({ msg: "Token inválido o expirado." });
  }
  res.status(200).json({ msg: "Token válido. Puedes crear una nueva contraseña." });
};

// Paso 3: Crear nueva contraseña
export const crearNuevoPasswordCliente = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!password || !confirmPassword) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Las contraseñas no coinciden." });
  }

  const clienteBDD = await Cliente.findOne({ token });
  if (!clienteBDD) {
    return res.status(404).json({ msg: "Token inválido." });
  }

  clienteBDD.passwordPropietario = await clienteBDD.encrypPassword(password);
  clienteBDD.token = null;
  await clienteBDD.save();

  res.status(200).json({ msg: "Contraseña actualizada. Ya puedes iniciar sesión." });
};



export{
    registrarCliente,
    listarClientes,
    detalleCliente,
    detalleclienteac,
    eliminarCliente,
    actualizarCliente,
    loginPropietario,
    perfilPropietario,


    registrarClientePublico,


    actualizarPasswordCliente, //
    
    registrarClientePorAdmin //  exportar la nueva función



}

















