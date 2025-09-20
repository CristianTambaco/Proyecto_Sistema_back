import {Router} from 'express'
import { eliminarAtencion, pagarAtencion, registrarAtencion } from '../controllers/atencion_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()


router.post('/atencion/registro',verificarTokenJWT,registrarAtencion)

router.delete('/atencion/:id',verificarTokenJWT,eliminarAtencion)

router.post('/atencion/pago',verificarTokenJWT,pagarAtencion)


export default router