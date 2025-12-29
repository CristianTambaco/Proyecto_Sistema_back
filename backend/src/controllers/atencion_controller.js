import Atencion from "../models/Atencion.js"
import mongoose from "mongoose"


import { Stripe } from "stripe"


import Horario from '../models/Horario.js'; // <-- Importa el modelo Horario



const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)



const registrarAtencion = async (req, res) => {
  const { cliente, fechaCita, horaCita } = req.body;

  


  // 👉 NUEVA: Validar que la fecha y hora estén dentro de los horarios
    const fechaObj = new Date(fechaCita);
    const diaSemana = fechaObj.getDay();
    let nombreDia;
    switch(diaSemana) {
        case 0: nombreDia = "Domingo"; break;
        case 1: nombreDia = "Lunes"; break;
        case 2: nombreDia = "Martes"; break;
        case 3: nombreDia = "Miércoles"; break;
        case 4: nombreDia = "Jueves"; break;
        case 5: nombreDia = "Viernes"; break;
        case 6: nombreDia = "Sábado"; break;
        default:
            return res.status(400).json({ msg: "El día seleccionado no es válido." });
    }

    // Buscar el horario del día
    const horarioDelDia = await Horario.findOne({ dia: nombreDia, estado: true });
    if (!horarioDelDia) {
        return res.status(400).json({ msg: "No atendemos ese día." });
    }

    // Validar la hora
    const [horaInput, minutoInput] = horaCita.split(':').map(Number);
    const [horaApertura, minutoApertura] = horarioDelDia.horaApertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = horarioDelDia.horaCierre.split(':').map(Number);

    const tiempoInput = horaInput * 60 + minutoInput;
    const tiempoApertura = horaApertura * 60 + minutoApertura;
    const tiempoCierre = horaCierre * 60 + minutoCierre;

    if (tiempoInput < tiempoApertura || tiempoInput >= tiempoCierre) {
        return res.status(400).json({ msg: `Nuestros horarios para ${nombreDia} son de ${horarioDelDia.horaApertura} a ${horarioDelDia.horaCierre}. Por favor, elige otra hora.` });
    }




  // Validación del cliente
  if (!mongoose.Types.ObjectId.isValid(cliente))
    return res.status(400).json({ msg: "ID de cliente inválido" });

  // Validación de fecha y hora
  if (!fechaCita || !horaCita)
    return res.status(400).json({ msg: "Fecha y hora de la cita son obligatorias" });

  // Validar formato de hora (HH:mm)
  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horaCita))
    return res.status(400).json({ msg: "Formato de hora inválido. Use HH:mm" });

  // Opcional: evitar fechas pasadas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitada = new Date(fechaCita);
  if (fechaSolicitada < hoy)
    return res.status(400).json({ msg: "No se permiten fechas pasadas" });

  // Verificar si ya existe una cita con el mismo cliente, fecha y hora
  const citaExistente = await Atencion.findOne({  
    fechaCita: new Date(fechaCita),
    horaCita: horaCita,
    cliente: cliente
  });
  if (citaExistente) {
    return res.status(400).json({ msg: "Ya tienes una reserva en esa fecha y hora." });
  }

  // Crear la atención
  try {
    const nuevaAtencion = await Atencion.create(req.body);
    return res.status(201).json({ msg: "Reserva creada correctamente", atencion: nuevaAtencion });
  } catch (error) {
    console.error("Error al registrar atención:", error);
    return res.status(500).json({ msg: "Error al crear la atención", error });
  }



};



const eliminarAtencion = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe ese registro`})
    await Atencion.findByIdAndDelete(req.params.id)
    res.status(200).json({msg:"Registro eliminado exitosamente"})
}



const pagarAtencion = async (req, res) => {

    // paso 1 obtener informacion del req.body
    const { paymentMethodId, treatmentId, cantidad, motivo } = req.body

    // paso 2  validaciones
    try {

        const atencion = await Atencion.findById(treatmentId).populate('cliente')
        if (!atencion) return res.status(404).json({ message: "Atencion no encontrado" })
    // segunda validacion
        if (atencion.estadoPago === "Pagado") return res.status(400).json({ message: "Este atencion ya fue pagado" })
    // tercera validacion
        if (!paymentMethodId) return res.status(400).json({ message: "paymentMethodId no proporcionado" })


    // paso 3 logica del negocio

        let [cliente] = (await stripe.customers.list({ email:atencion.emailPropietario, limit: 1 })).data || [];
        

        if (!cliente) {
            cliente = await stripe.customers.create({ name:atencion.nombrePropietario, email:atencion.emailPropietario });
        }
        

        const payment = await stripe.paymentIntents.create({
            amount:cantidad,
            currency: "USD",
            description: motivo,
            payment_method: paymentMethodId,  
            confirm: true,
            customer: cliente.id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        })

        if (payment.status === "succeeded") {
            await Atencion.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" });

            // paso 4 Mensaje al cliente de cual fue el resultado
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        }



    } catch (error) {
        res.status(500).json({ msg: "Error al intentar pagar el atencion", error });
    }
}


// Listar todas las atenciones (solo para estilista y administrador)
const listarTodasAtenciones = async (req, res) => {
    try {
        const atenciones = await Atencion.find()
            .populate('cliente', 'nombrePropietario nombreMascota emailPropietario')
            .sort({ fechaCita: 1 }); // Orden ascendente por fecha de cita
        res.status(200).json(atenciones);
    } catch (error) {
        console.error("Error al listar todas las atenciones:", error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};





export{
    registrarAtencion,
    eliminarAtencion,
    pagarAtencion,
    listarTodasAtenciones // 
}



