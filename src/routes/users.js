'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fs = require('fs-extra');
const claudinary = require('cloudinary');

claudinary.config({
    cloud_name: 'dvdgijhpc',
    api_key: '992268627513137',
    api_secret: 'W3NBvBWIP2Qe00JQYltXAzMLoSc'
});

router.get('/users/get-users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/users/new-user', async (req, res) => {
    console.log(req.body);
    const result = await claudinary.v2.uploader.upload(req.file.path);
    const newUser = new User({
        imageURL: result.url,
        public_id: result.public_id,
        userName : req.body.userName,
        userEmail: req.body.userEmail,
        userBirthDate : req.body.userBirthDate,
        bibliography: req.body.bibliography,
        userType : 1,
        userPassword : req.body.userPassword
    });
    newUser.userPassword = await newUser.encryptPassword(req.body.userPassword);

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
	
	const user = await User.findOne({userEmail: req.body.email});
	console.log(user);
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

module.exports = router;