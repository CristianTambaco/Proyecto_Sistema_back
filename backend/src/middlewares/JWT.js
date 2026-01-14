import jwt from "jsonwebtoken"
import Estilista from "../models/Estilista.js"
import Cliente from "../models/Cliente.js"
import Administrador from "../models/Administrador.js"


const crearTokenJWT = (id, rol) => {

    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}


const verificarTokenJWT = async (req, res, next) => {
    if (!req.headers.authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado o inválido" })

    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Formato de token inválido. Debe ser 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const { id, rol } = jwt.verify(token, process.env.JWT_SECRET);

        let user;

        if (rol === "estilista") {
      user = await Estilista.findById(id).lean().select("-password");
    } else if (rol === "administrador") {
      user = await Administrador.findById(id).lean().select("-password");
    } else if (rol === "cliente") {
      user = await Cliente.findById(id).lean().select("-password");
      //  NUEVA VALIDACIÓN: Si es cliente y está inactivo, denegar acceso
      if (user && user.estadoMascota === false) {
        return res.status(403).json({ msg: "Tu cuenta está inactiva. Contacta al administrador." });
      }
    } else {
      return res.status(401).json({ msg: "Rol desconocido en el token" });
    }

        if (!user) {
            return res.status(401).json({ msg: "Usuario no encontrado" });
        }

        // Asignar el usuario a req.user y también mantener el rol
        req.user = user;
        req.rol = rol; // Opcional: para fácil acceso al rol

        next();
    } catch (error) {
        console.error("Error verificando token:", error.message);
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
}

export { 
    crearTokenJWT,
    verificarTokenJWT 
}