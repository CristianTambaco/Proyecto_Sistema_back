import Atencion from "../models/Atencion.js"
import mongoose from "mongoose"


import { Stripe } from "stripe"

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)



const registrarAtencion = async (req,res)=>{
    const {cliente} = req.body
    if( !mongoose.Types.ObjectId.isValid(cliente) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    await Atencion.create(req.body)
    res.status(200).json({msg:"Registro exitoso del atencion"})
}


const eliminarAtencion = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe ese atencion`})
    await Atencion.findByIdAndDelete(req.params.id)
    res.status(200).json({msg:"Atencion eliminado exitosamente"})
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






export{
    registrarAtencion,
    eliminarAtencion,
    pagarAtencion
}



