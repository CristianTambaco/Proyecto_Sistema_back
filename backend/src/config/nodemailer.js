import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegister = (userMail, token) => {

    let mailOptions = {
        from: 'admin@PetManageQ.com',
        to: userMail,
        subject: "PetManageQ ",
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirm/${token}">aquí</a> para confirmar tu cuenta.</p>
        <hr>
        <footer>El equipo de PetManageQ te da la más cordial bienvenida.</footer>
        `
    }
    

    // let mailOptions = {
    //     from: 'admin@PetManageQ.com',
    //     to: userMail,
    //     subject: "🐾 Bienvenido a PetManageQ",
    //     html: `
    //     <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    //         <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
    //             <!-- Encabezado -->
    //             <div style="background: linear-gradient(135deg, #4CAF50, #81C784); padding: 20px; text-align: center; color: black;">
    //                 <h1 style="margin: 0; font-size: 26px;">¡Bienvenido a PetManageQ!</h1>
    //                 <p style="margin: 5px 0 0;">La gestión inteligente para tu peluquería canina </p>
    //             </div>
                
    //             <!-- Contenido -->
    //             <div style="padding: 30px; text-align: center; color: #333;">
    //                 <p style="font-size: 18px; margin-bottom: 20px;">
    //                     Hola, gracias por registrarte en <b>PetManageQ</b>.  
    //                     Haz clic en el siguiente botón para confirmar tu cuenta:
    //                 </p>
                    
    //                 <a href="${process.env.URL_FRONTEND}confirm/${token}" 
    //                     style="display: inline-block; background: #4CAF50; color: #fff; text-decoration: none; 
    //                            padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold;
    //                            transition: background 0.3s;">
    //                     Confirmar cuenta
    //                 </a>
                    
    //                 <p style="font-size: 14px; margin-top: 20px; color: #666;">
    //                     Si el botón no funciona, copia y pega este enlace en tu navegador:  
    //                     <br>
    //                     <span style="color:#4CAF50;">${process.env.URL_FRONTEND}confirm/${token}</span>
    //                 </p>
    //             </div>
                
    //             <!-- Footer -->
    //             <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 13px; color: #999;">
    //                 <p style="margin: 0;">El equipo de <b>PetManageQ</b> te da la más cordial bienvenida 💚</p>
    //             </div>
    //         </div>
    //     </div>
    //     `
    // }
    

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
        }
    })
}


// const sendMailToRecoveryPassword = async(userMail,token)=>{
//     let info = await transporter.sendMail({
//     from: 'admin@PetManageQ.com',
//     to: userMail,
//     subject: "Correo para reestablecer tu contraseña",
//     html: `
//     <h1>PetManageQ </h1>
//     <hr>
//     <a href=${process.env.URL_FRONTEND}reset/${token}>Clic para reestablecer tu contraseña</a>
//     <hr>
//     <footer>El equipo de PetManageQ te da la más cordial bienvenida.</footer>
//     `
//     });
//     console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
// }



const sendMailToRecoveryPassword = async (userMail, token) => {
    let info = await transporter.sendMail({
        from: 'admin@PetManageQ.com',
        to: userMail,
        subject: "🔐 Restablece tu contraseña - PetManageQ",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Encabezado -->
                <div style="background: linear-gradient(135deg, #FF7043, #FFB74D); padding: 20px; text-align: center; color: black;">
                    <h1 style="margin: 0; font-size: 26px;">Recuperación de Contraseña</h1>
                    <p style="margin: 5px 0 0;">No te preocupes, estamos aquí para ayudarte </p>
                </div>
                
                <!-- Contenido -->
                <div style="padding: 30px; text-align: center; color: #333;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Hola, recibimos una solicitud para <b>restablecer tu contraseña</b> en <b>PetManageQ</b>.  
                        Haz clic en el siguiente botón para continuar:
                    </p>
                    
                    <a href="${process.env.URL_FRONTEND}reset/${token}" 
                        style="display: inline-block; background: #FF7043; color: #fff; text-decoration: none; 
                               padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold;
                               transition: background 0.3s;">
                        Restablecer contraseña
                    </a>
                    
                    <p style="font-size: 14px; margin-top: 20px; color: #666;">
                        Si no solicitaste este cambio, ignora este correo.  
                        Si el botón no funciona, copia y pega este enlace en tu navegador:  
                        <br>
                        <span style="color:#FF7043;">${process.env.URL_FRONTEND}reset/${token}</span>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 13px; color: #999;">
                    <p style="margin: 0;">El equipo de <b>PetManageQ</b> siempre está para ayudarte 🧡</p>
                </div>
            </div>
        </div>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}






// const sendMailToOwner = async(userMail,password)=>{
//     let info = await transporter.sendMail({
//     from: 'admin@PetManageQ.com',
//     to: userMail,
//     subject: "Correo de bienvenida - Propietario de la mascota",
//     html: `
//     <h1>PetManageQ </h1>
//     <hr>
//     <p>Contraseña de acceso: ${password}</p>
//     <a href=${process.env.URL_FRONTEND}login>Clic para iniciar sesión</a>
//     <hr>
//     <footer>El equipo de PetManageQ te da la más cordial bienvenida.</footer>
//     `
//     });
//     console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
// }


const sendMailToOwner = async (userMail, password) => {
    let info = await transporter.sendMail({
        from: 'admin@PetManageQ.com',
        to: userMail,
        subject: "🐾 Bienvenido a PetManageQ - Propietario de la Mascota",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Encabezado -->
                <div style="background: linear-gradient(135deg, #2196F3, #64B5F6); padding: 20px; text-align: center; color: black;">
                    <h1 style="margin: 0; font-size: 26px;">¡Bienvenido a PetManageQ!</h1>
                    <p style="margin: 5px 0 0;">Tu espacio digital para la gestión de tu mascota </p>
                </div>
                
                <!-- Contenido -->
                <div style="padding: 30px; text-align: center; color: #333;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Hola 👋, hemos creado tu cuenta como <b>propietario de mascota</b> en <b>PetManageQ</b>.  
                        Aquí tienes tus credenciales de acceso:
                    </p>
                    
                    <div style="background:#f9f9f9; border:1px solid #ddd; padding:15px; border-radius:8px; margin:20px auto; max-width: 350px; text-align:left;">
                        <p style="margin:0; font-size:16px;"><b>📧 Correo:</b> ${userMail}</p>
                        <p style="margin:0; font-size:16px;"><b>🔑 Contraseña:</b> ${password}</p>
                    </div>
                    
                    <a href="${process.env.URL_FRONTEND}login" 
                        style="display: inline-block; background: #2196F3; color: #fff; text-decoration: none; 
                               padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold;
                               transition: background 0.3s;">
                        Iniciar sesión
                    </a>
                    
                    <p style="font-size: 14px; margin-top: 20px; color: #666;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:  
                        <br>
                        <span style="color:#2196F3;">${process.env.URL_FRONTEND}login</span>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 13px; color: #999;">
                    <p style="margin: 0;">El equipo de <b>PetManageQ</b> te da la más cordial bienvenida 💙</p>
                </div>
            </div>
        </div>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}



export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToOwner
}

