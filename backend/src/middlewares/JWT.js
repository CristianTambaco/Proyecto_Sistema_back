import jwt from "jsonwebtoken"
import Estilista from "../models/Estilista.js"
import Cliente from "../models/Cliente.js"
import Administrador from "../models/Administrador.js"

const crearTokenJWT = (id, rol) => {

    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const verificarTokenJWT = async (req, res, next) => {

    if (!req.headers.authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado o inválido" })

    const { authorization } = req.headers

    try {
        const token = authorization.split(" ")[1];
        const { id, rol } = jwt.verify(token,process.env.JWT_SECRET)
        if (rol === "estilista") {
            req.estilistaBDD = await Estilista.findById(id).lean().select("-password")
            next()
        }
        else if (rol === "administrador") {
            req.adminBDD = await Administrador.findById(id).lean().select("-password")
            next()
        } 
        else{
            req.clienteBDD = await Cliente.findById(id).lean().select("-password")
            next()
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
}


export { 
    crearTokenJWT,
    verificarTokenJWT 
}
