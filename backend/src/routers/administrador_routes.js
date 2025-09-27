import {Router} from 'express'
import { actualizarPassword, actualizarPerfil,comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from '../controllers/administrador_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'


const router = Router()


router.post('/registroad',registro)


router.get('/confirmar/:token',confirmarMail)


router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)


// ----
router.post('/loginad',login)


router.get('/perfil',verificarTokenJWT,perfil)

router.put('/administrador/:id',verificarTokenJWT,actualizarPerfil)

router.put('/administrador/actualizarpassword/:id',verificarTokenJWT,actualizarPassword)


export default router

