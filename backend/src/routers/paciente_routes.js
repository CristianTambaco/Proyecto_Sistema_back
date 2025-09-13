import {Router} from 'express'
import { actualizarPaciente,detallePaciente, detallepacienteac, eliminarPaciente, listarPacientes, loginPropietario, perfilPropietario, registrarPaciente } from '../controllers/paciente_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()




router.post('/paciente/login',loginPropietario)



// rutas privadas( + verificarTokenJWT), el orden si importa


router.get('/paciente/perfil',verificarTokenJWT,perfilPropietario)


router.post("/paciente/registro",verificarTokenJWT, registrarPaciente)
router.get("/pacientes",verificarTokenJWT,listarPacientes)
router.get("/paciente/:id",verificarTokenJWT, detallePaciente)
router.get("/pacienteac/:id",verificarTokenJWT, detallepacienteac)
router.delete("/paciente/eliminar/:id", verificarTokenJWT,eliminarPaciente)

router.put("/paciente/actualizar/:id", verificarTokenJWT,actualizarPaciente)

export default router







