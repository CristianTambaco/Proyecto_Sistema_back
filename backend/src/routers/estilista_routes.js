import {Router} from 'express'
import { actualizarPassword, actualizarPerfil,comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from '../controllers/estilista_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'


const router = Router()


router.post('/registro',registro)


router.get('/confirmar/:token',confirmarMail)


router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)


// ----
router.post('/login',login)


router.get('/perfil',verificarTokenJWT,perfil)

router.put('/estilista/:id',verificarTokenJWT,actualizarPerfil)

router.put('/estilista/actualizarpassword/:id',verificarTokenJWT,actualizarPassword)




export default router

