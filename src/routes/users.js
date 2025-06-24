'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const createMailerService = require("../services/mailer/mailerFactory");
const fs = require('fs-extra');
const cloudinary = require('cloudinary');
const crypto = require("crypto");
const path = require("path");

const mailer = createMailerService();

cloudinary.config({
    cloud_name: 'dvdgijhpc',
    api_key: '992268627513137',
    api_secret: 'W3NBvBWIP2Qe00JQYltXAzMLoSc'
});

router.get('/users/get-users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/users/new-user', async (req, res) => {
    console.log(JSON.stringify(req.file, null, 2));

    console.log("DAta " + JSON.stringify(req.body, null, 2));
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const newUser = new User({
        imageURL: result.url,
        imagePublic_id: result.public_id,
        userName: req.body.userName,
        name: req.body.name,
        bio: req.body.bio,
        email: req.body.email,
        gender: req.body.gender,
        password: req.body.password,
        birthDate: new Date(req.body.birthDate),
        userType: req.body.userType,
    });

    console.log("NEW USER " +JSON.stringify(newUser, null, 2));
    newUser.password = await newUser.encryptPassword(req.body.password);

    await newUser.save((error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El usuario no se pudo registar`
            })
        } else {
            res.json({
                msj: 'El usuario se registró correctamente'
            });
        }
    });
    await fs.unlink(req.file.path); // delete local file
});

router.post('/users/log-in', async (req, res) => {
	
	const user = await User.findOne({email: req.body.email});
	console.log(user);
    console.log(req.body.email);
		if(!user) {
			res.status(500).send({
				status: 500,
				error: `Usuario no encontrado`
			})
		} else {
			const match = await user.matchPassword(req.body.password);
			if(match) {
				res.json(user);
			} else {
				res.status(500).send({
					status: 500,
					error: `Contraseña incorrecta`
				})
			}
		}
});

router.put('/users/update-user/:id', async (req, res) => {
    console.log(req.body)
    const updateTask = await Task.findByIdAndUpdate(req.params.id, {
        userName : req.body.userName
    })
    updateTask.save((error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El usuario no se pudo modificar`
            });
        } else {
            res.json({
                msj: 'El usuario se modificó correctamente'
            });
        }
    });
});

router.delete('/users/delete-user/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    Task.findByIdAndDelete(id, (error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El usuario no se pudo eliminar`
            });
        } else {
            res.json({
                msg: `El usuario se elimino con exito`
            })
        }
    });
});

router.get('/users/get-user-by-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al buscar el usuario" });
    }
});

router.get('/users/get-user-by-username/:userName', async (req, res) => {
    try {
        const { userName } = req.params;
        const user = await User.findOne({ userName: userName });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al buscar el usuario" });
    }
});

router.post('/users/restore-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
 
      const token = crypto.randomBytes(32).toString("hex");
  
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();

      const logoPath = path.resolve(__dirname, "../public/assets/posthub.png");
      const logoContent = fs.readFileSync(logoPath);
      const resetLink = `http://localhost:3000/reset-password/${token}`;
      await mailer.sendMail({
        from: `"Tu App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Restaurar contraseña",
        html:
          "<div style=\"width: 100%; max-width: 800px; margin: auto; font-family: Arial, sans-serif;\">" +
          "  <div style=\"background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px;\">" +
          "    <div style=\"margin-bottom: 20px;\">" +
          "      <img src=\"cid:logo\" style=\"height: 40px;\" alt=\"Post Hub logo\" />" +
          "    </div>" +
          `   <h2 style="color: #000;">Estimado ${user.name}!</h2>` +
          "    <p style=\"font-size: 16px;\">Hemos recibido la solicitud de restablecer contraseña,<br/> a continuación encontrará su contraseña temporal.</p>" +
          `   <a href="${resetLink}"><button style="padding: 10px; background-color: #83b106; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Restaurar tu contraseña</button></a>` +
          "    <br/><br/>" +
          "    <p style=\"font-size: 16px;\">Gracias!</p>" +
          "  </div>" +
          "</div>",
        attachments: [
          {
            filename: "posthub.png",
            content: logoContent,
            cid: "logo",
            contentType: "image/png"
          },
        ],
      });      
  
      console.log("Ruta resuelta:", logoPath);
      res.json({ message: "Correo enviado con instrucciones" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error en el proceso de restauración" });
    }
  });

  router.post('/users/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // verifica que no haya expirado
      });
  
      if (!user) {
        return res.status(400).json({ error: "Token inválido o expirado" });
      }
  
      // Actualizar contraseña
      user.password = newPassword; // Hashealo si no lo estás haciendo en un middleware
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      await user.save();
  
      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
  });

module.exports = router;