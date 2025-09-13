import Tratamiento from "../models/Tratamiento.js"
import mongoose from "mongoose"


import { Stripe } from "stripe"

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)



const registrarTratamiento = async (req,res)=>{
    const {paciente} = req.body
    if( !mongoose.Types.ObjectId.isValid(paciente) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    await Tratamiento.create(req.body)
    res.status(200).json({msg:"Registro exitoso del tratamiento"})
}


const eliminarTratamiento = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe ese tratamiento`})
    await Tratamiento.findByIdAndDelete(req.params.id)
    res.status(200).json({msg:"Tratamiento eliminado exitosamente"})
}



const pagarTratamiento = async (req, res) => {

    // paso 1 obtener informacion del req.body
    const { paymentMethodId, treatmentId, cantidad, motivo } = req.body

    // paso 2  validaciones
    try {

        const tratamiento = await Tratamiento.findById(treatmentId).populate('paciente')
        if (!tratamiento) return res.status(404).json({ message: "Tratamiento no encontrado" })
    // segunda validacion
        if (tratamiento.estadoPago === "Pagado") return res.status(400).json({ message: "Este tratamiento ya fue pagado" })
    // tercera validacion
        if (!paymentMethodId) return res.status(400).json({ message: "paymentMethodId no proporcionado" })


    // paso 3 logica del negocio

        let [cliente] = (await stripe.customers.list({ email:tratamiento.emailPropietario, limit: 1 })).data || [];
        

        if (!cliente) {
            cliente = await stripe.customers.create({ name:tratamiento.nombrePropietario, email:tratamiento.emailPropietario });
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
            await Tratamiento.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" });

            // paso 4 Mensaje al cliente de cual fue el resultado
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        }



    } catch (error) {
        res.status(500).json({ msg: "Error al intentar pagar el tratamiento", error });
    }
}






export{
    registrarTratamiento,
    eliminarTratamiento,
    pagarTratamiento
}



