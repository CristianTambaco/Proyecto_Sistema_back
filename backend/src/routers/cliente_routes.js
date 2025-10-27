import {Router} from 'express'
import { registrarClientePublico, actualizarCliente,detalleCliente, detalleclienteac, eliminarCliente, listarClientes, loginPropietario, perfilPropietario, registrarCliente } from '../controllers/cliente_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()




router.post('/cliente/login',loginPropietario)


// Ruta pública para que el cliente se registre solo
router.post('/cliente/registro-publico', registrarClientePublico); // <-- Nueva ruta pública


// rutas privadas( + verificarTokenJWT), el orden si importa


router.get('/cliente/perfil',verificarTokenJWT,perfilPropietario)


router.post("/cliente/registro",verificarTokenJWT, registrarCliente)
router.get("/clientes",verificarTokenJWT,listarClientes)
router.get("/cliente/:id",verificarTokenJWT, detalleCliente)
router.get("/clienteac/:id",verificarTokenJWT, detalleclienteac)
router.delete("/cliente/eliminar/:id", verificarTokenJWT,eliminarCliente)

router.put("/cliente/actualizar/:id", verificarTokenJWT,actualizarCliente)

export default router







