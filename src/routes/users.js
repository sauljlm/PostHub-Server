'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fs = require('fs-extra');
const cloudinary = require('cloudinary');

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
        public_id: result.public_id,
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
			// console.log(req.body.password);
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

module.exports = router;